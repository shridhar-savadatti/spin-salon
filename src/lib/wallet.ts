import { getSql } from "@/lib/db";
import { generateId } from "@/lib/utils";
import type { WalletReferenceType, WalletTransaction } from "@/types";

export async function ensureWalletTables() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      customer_phone TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      balance DECIMAL NOT NULL DEFAULT 0,
      bonus_balance DECIMAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS wallet_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      recharge_amount DECIMAL NOT NULL,
      credit_amount DECIMAL NOT NULL,
      bonus_amount DECIMAL NOT NULL DEFAULT 0,
      is_active SMALLINT NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id TEXT PRIMARY KEY,
      wallet_id TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      type TEXT NOT NULL,
      amount DECIMAL NOT NULL,
      principal_amount DECIMAL NOT NULL DEFAULT 0,
      bonus_amount DECIMAL NOT NULL DEFAULT 0,
      balance_after DECIMAL NOT NULL,
      bonus_balance_after DECIMAL NOT NULL,
      reference_type TEXT,
      reference_id TEXT,
      payment_method TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    )
  `;
  try {
    await sql`ALTER TABLE bills ADD COLUMN IF NOT EXISTS wallet_amount DECIMAL NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE bills ADD COLUMN IF NOT EXISTS wallet_transaction_id TEXT`;
  } catch { /* columns already exist */ }
}

function mapTx(r: Record<string, unknown>): WalletTransaction {
  return {
    id: r.id as string,
    walletId: r.wallet_id as string,
    customerPhone: r.customer_phone as string,
    customerName: r.customer_name as string,
    type: r.type as WalletTransaction["type"],
    amount: Number(r.amount),
    principalAmount: Number(r.principal_amount),
    bonusAmount: Number(r.bonus_amount),
    balanceAfter: Number(r.balance_after),
    bonusBalanceAfter: Number(r.bonus_balance_after),
    referenceType: r.reference_type as WalletReferenceType | null,
    referenceId: r.reference_id as string | null,
    paymentMethod: r.payment_method as string | null,
    notes: r.notes as string | null,
    createdAt: r.created_at as string,
  };
}

export async function ensureWallet(customerPhone: string, customerName: string) {
  const sql = getSql();
  const now = new Date().toISOString();
  await sql`
    INSERT INTO wallets (id, customer_phone, customer_name, balance, bonus_balance, created_at, updated_at)
    VALUES (${generateId()}, ${customerPhone}, ${customerName}, 0, 0, ${now}, ${now})
    ON CONFLICT (customer_phone) DO NOTHING
  `;
}

export async function getWallet(customerPhone: string) {
  const sql = getSql();
  const rows = await sql`SELECT * FROM wallets WHERE customer_phone = ${customerPhone}`;
  if (!rows[0]) return null;
  const r = rows[0] as Record<string, unknown>;
  return {
    customerPhone: r.customer_phone as string,
    customerName: r.customer_name as string,
    balance: Number(r.balance),
    bonusBalance: Number(r.bonus_balance),
  };
}

export async function getWalletTransactions(customerPhone: string, limit = 50): Promise<WalletTransaction[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM wallet_transactions WHERE customer_phone = ${customerPhone}
    ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows.map((r) => mapTx(r as Record<string, unknown>));
}

export async function rechargeWallet(opts: {
  customerPhone: string;
  customerName: string;
  creditAmount: number;
  bonusAmount: number;
  paymentMethod: string;
  referenceType: WalletReferenceType;
  referenceId: string | null;
  notes: string | null;
}): Promise<WalletTransaction> {
  await ensureWallet(opts.customerPhone, opts.customerName);
  const sql = getSql();
  const now = new Date().toISOString();
  const txId = generateId();
  const rows = await sql`
    WITH upd AS (
      UPDATE wallets SET
        balance = balance + ${opts.creditAmount}::numeric,
        bonus_balance = bonus_balance + ${opts.bonusAmount}::numeric,
        updated_at = ${now}
      WHERE customer_phone = ${opts.customerPhone}
      RETURNING id AS wallet_id, balance AS balance_after, bonus_balance AS bonus_balance_after
    )
    INSERT INTO wallet_transactions (
      id, wallet_id, customer_phone, customer_name, type, amount, principal_amount, bonus_amount,
      balance_after, bonus_balance_after, reference_type, reference_id, payment_method, notes, created_at
    )
    SELECT ${txId}, wallet_id, ${opts.customerPhone}, ${opts.customerName}, 'recharge',
      ${opts.creditAmount + opts.bonusAmount}::numeric, ${opts.creditAmount}::numeric, ${opts.bonusAmount}::numeric,
      balance_after, bonus_balance_after, ${opts.referenceType}, ${opts.referenceId}, ${opts.paymentMethod}, ${opts.notes}, ${now}
    FROM upd
    RETURNING *
  `;
  return mapTx(rows[0] as Record<string, unknown>);
}

export async function deductWallet(opts: {
  customerPhone: string;
  customerName: string;
  amount: number;
  referenceType: WalletReferenceType;
  referenceId: string | null;
  notes: string | null;
}): Promise<WalletTransaction | null> {
  await ensureWallet(opts.customerPhone, opts.customerName);
  const sql = getSql();
  const now = new Date().toISOString();
  const txId = generateId();
  const rows = await sql`
    WITH current AS (
      SELECT id, balance, bonus_balance FROM wallets WHERE customer_phone = ${opts.customerPhone}
    ),
    upd AS (
      UPDATE wallets w SET
        balance = c.balance - GREATEST(${opts.amount}::numeric - c.bonus_balance, 0),
        bonus_balance = c.bonus_balance - LEAST(c.bonus_balance, ${opts.amount}::numeric),
        updated_at = ${now}
      FROM current c
      WHERE w.id = c.id AND (c.balance + c.bonus_balance) >= ${opts.amount}::numeric
      RETURNING w.id AS wallet_id, w.balance AS balance_after, w.bonus_balance AS bonus_balance_after,
                c.balance AS old_balance, c.bonus_balance AS old_bonus_balance
    )
    INSERT INTO wallet_transactions (
      id, wallet_id, customer_phone, customer_name, type, amount, principal_amount, bonus_amount,
      balance_after, bonus_balance_after, reference_type, reference_id, payment_method, notes, created_at
    )
    SELECT ${txId}, wallet_id, ${opts.customerPhone}, ${opts.customerName}, 'usage',
      ${-opts.amount}::numeric,
      (balance_after - old_balance), (bonus_balance_after - old_bonus_balance),
      balance_after, bonus_balance_after, ${opts.referenceType}, ${opts.referenceId}, NULL, ${opts.notes}, ${now}
    FROM upd
    RETURNING *
  `;
  if (!rows[0]) return null;
  return mapTx(rows[0] as Record<string, unknown>);
}

export async function refundWallet(opts: {
  customerPhone: string;
  customerName: string;
  amount: number;
  notes: string | null;
}): Promise<WalletTransaction> {
  await ensureWallet(opts.customerPhone, opts.customerName);
  const sql = getSql();
  const now = new Date().toISOString();
  const txId = generateId();
  const rows = await sql`
    WITH upd AS (
      UPDATE wallets SET balance = balance + ${opts.amount}::numeric, updated_at = ${now}
      WHERE customer_phone = ${opts.customerPhone}
      RETURNING id AS wallet_id, balance AS balance_after, bonus_balance AS bonus_balance_after
    )
    INSERT INTO wallet_transactions (
      id, wallet_id, customer_phone, customer_name, type, amount, principal_amount, bonus_amount,
      balance_after, bonus_balance_after, reference_type, reference_id, payment_method, notes, created_at
    )
    SELECT ${txId}, wallet_id, ${opts.customerPhone}, ${opts.customerName}, 'refund',
      ${opts.amount}::numeric, ${opts.amount}::numeric, 0, balance_after, bonus_balance_after,
      'manual', NULL, NULL, ${opts.notes}, ${now}
    FROM upd
    RETURNING *
  `;
  return mapTx(rows[0] as Record<string, unknown>);
}

export async function addWalletBonus(opts: {
  customerPhone: string;
  customerName: string;
  amount: number;
  notes: string | null;
}): Promise<WalletTransaction> {
  await ensureWallet(opts.customerPhone, opts.customerName);
  const sql = getSql();
  const now = new Date().toISOString();
  const txId = generateId();
  const rows = await sql`
    WITH upd AS (
      UPDATE wallets SET bonus_balance = bonus_balance + ${opts.amount}::numeric, updated_at = ${now}
      WHERE customer_phone = ${opts.customerPhone}
      RETURNING id AS wallet_id, balance AS balance_after, bonus_balance AS bonus_balance_after
    )
    INSERT INTO wallet_transactions (
      id, wallet_id, customer_phone, customer_name, type, amount, principal_amount, bonus_amount,
      balance_after, bonus_balance_after, reference_type, reference_id, payment_method, notes, created_at
    )
    SELECT ${txId}, wallet_id, ${opts.customerPhone}, ${opts.customerName}, 'bonus',
      ${opts.amount}::numeric, 0, ${opts.amount}::numeric, balance_after, bonus_balance_after,
      'manual', NULL, NULL, ${opts.notes}, ${now}
    FROM upd
    RETURNING *
  `;
  return mapTx(rows[0] as Record<string, unknown>);
}

export async function adjustWallet(opts: {
  customerPhone: string;
  customerName: string;
  delta: number;
  notes: string;
}): Promise<WalletTransaction | null> {
  await ensureWallet(opts.customerPhone, opts.customerName);
  const sql = getSql();
  const now = new Date().toISOString();
  const txId = generateId();
  const rows = await sql`
    WITH upd AS (
      UPDATE wallets SET balance = balance + ${opts.delta}::numeric, updated_at = ${now}
      WHERE customer_phone = ${opts.customerPhone} AND (balance + ${opts.delta}::numeric) >= 0
      RETURNING id AS wallet_id, balance AS balance_after, bonus_balance AS bonus_balance_after
    )
    INSERT INTO wallet_transactions (
      id, wallet_id, customer_phone, customer_name, type, amount, principal_amount, bonus_amount,
      balance_after, bonus_balance_after, reference_type, reference_id, payment_method, notes, created_at
    )
    SELECT ${txId}, wallet_id, ${opts.customerPhone}, ${opts.customerName}, 'adjustment',
      ${opts.delta}::numeric, ${opts.delta}::numeric, 0, balance_after, bonus_balance_after,
      'manual', NULL, NULL, ${opts.notes}, ${now}
    FROM upd
    RETURNING *
  `;
  if (!rows[0]) return null;
  return mapTx(rows[0] as Record<string, unknown>);
}

export async function linkWalletTransactionToBill(transactionId: string, billId: string) {
  const sql = getSql();
  await sql`UPDATE wallet_transactions SET reference_id = ${billId} WHERE id = ${transactionId}`;
}

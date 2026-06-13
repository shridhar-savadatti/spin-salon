import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import { ensureWalletTables, deductWallet, linkWalletTransactionToBill } from "@/lib/wallet";

async function ensureBillsTable() {
  const sql = getSql();
  // Drop NOT NULL constraints that block POS (walk-in) bills
  try { await sql`ALTER TABLE bills ALTER COLUMN appointment_id DROP NOT NULL`; } catch { /* ok */ }
  try { await sql`ALTER TABLE bills ALTER COLUMN customer_phone DROP NOT NULL`; } catch { /* ok */ }
  await sql`
    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY,
      appointment_id TEXT NULL,
      bill_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      services_json TEXT NOT NULL,
      subtotal DECIMAL NOT NULL,
      discount_amount DECIMAL NOT NULL DEFAULT 0,
      discount_code TEXT,
      gst_amount DECIMAL NOT NULL DEFAULT 0,
      total DECIMAL NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'cash',
      paid SMALLINT NOT NULL DEFAULT 1,
      notes TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      staff_name TEXT,
      created_at TEXT NOT NULL
    )
  `;
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureBillsTable();
  await ensureWalletTables();

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const sql = getSql();

  const rows = from && to
    ? await sql`SELECT * FROM bills WHERE date >= ${from} AND date <= ${to} ORDER BY created_at DESC`
    : await sql`SELECT * FROM bills ORDER BY created_at DESC LIMIT 200`;

  return NextResponse.json(rows.map((r: Record<string, unknown>) => ({
    id: r.id,
    appointmentId: r.appointment_id,
    billNumber: r.bill_number,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    servicesJson: r.services_json,
    subtotal: Number(r.subtotal),
    discountAmount: Number(r.discount_amount),
    discountCode: r.discount_code,
    gstAmount: Number(r.gst_amount),
    total: Number(r.total),
    walletAmount: Number(r.wallet_amount ?? 0),
    walletTransactionId: r.wallet_transaction_id ?? null,
    paymentMethod: r.payment_method,
    paid: !!r.paid,
    notes: r.notes,
    date: r.date,
    time: r.time,
    staffName: r.staff_name,
    createdAt: r.created_at,
  })));
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    appointmentId, customerName, customerPhone, servicesJson,
    subtotal, discountAmount, discountCode, gstAmount, total,
    walletAmount, paymentMethod, notes, date, time, staffName,
  } = body;

  if (!customerName || total === undefined || total === null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const walletAmt = Number(walletAmount) || 0;
  if (walletAmt > 0 && !customerPhone) {
    return NextResponse.json({ error: "A customer phone number is required to use wallet balance" }, { status: 400 });
  }

  try {
  await ensureBillsTable();
  await ensureWalletTables();
  const sql = getSql();

  let walletTransactionId: string | null = null;
  if (walletAmt > 0) {
    const tx = await deductWallet({
      customerPhone,
      customerName,
      amount: walletAmt,
      referenceType: "bill",
      referenceId: null,
      notes: null,
    });
    if (!tx) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }
    walletTransactionId = tx.id;
  }

  // Check if bill already exists for this appointment (only if appointmentId provided)
  if (appointmentId) {
    const existing = await sql`SELECT bill_number FROM bills WHERE appointment_id = ${appointmentId}`;
    if (existing[0]) {
      return NextResponse.json({ billNumber: (existing[0] as { bill_number: string }).bill_number, alreadyExists: true });
    }
  }

  // Generate sequential bill number for today: SPIN-YYYYMMDD-NNN
  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const todayBills = await sql`SELECT COUNT(*) as c FROM bills WHERE date = ${date}`;
  const seq = String(parseInt((todayBills[0] as { c: string }).c) + 1).padStart(3, "0");
  const billNumber = `SPIN-${today}-${seq}`;

  const id = generateId();
  const now = new Date().toISOString();

  await sql`
    INSERT INTO bills (
      id, appointment_id, bill_number, customer_name, customer_phone,
      services_json, subtotal, discount_amount, discount_code, gst_amount,
      total, wallet_amount, wallet_transaction_id, payment_method, paid, notes, date, time, staff_name, created_at
    ) VALUES (
      ${id}, ${appointmentId}, ${billNumber}, ${customerName}, ${customerPhone},
      ${typeof servicesJson === "string" ? servicesJson : JSON.stringify(servicesJson)},
      ${subtotal}, ${discountAmount || 0}, ${discountCode || null}, ${gstAmount},
      ${total}, ${walletAmt}, ${walletTransactionId}, ${paymentMethod || "cash"}, 1, ${notes || null},
      ${date}, ${time}, ${staffName || null}, ${now}
    )
  `;

  if (walletTransactionId) {
    await linkWalletTransactionToBill(walletTransactionId, id);
  }

  return NextResponse.json({ id, billNumber }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Bills POST error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { ensureWalletTables, getWallet, getWalletTransactions } from "@/lib/wallet";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ phone: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { phone } = await params;
  const customerPhone = decodeURIComponent(phone);
  await ensureWalletTables();

  const wallet = await getWallet(customerPhone);
  let customerName = wallet?.customerName ?? null;

  if (!customerName) {
    const sql = getSql();
    const appt = await sql`
      SELECT customer_name FROM appointments WHERE customer_phone = ${customerPhone}
      ORDER BY date DESC LIMIT 1
    `;
    if (appt[0]) {
      customerName = (appt[0] as { customer_name: string }).customer_name;
    } else {
      const cust = await sql`SELECT name FROM customers WHERE phone = ${customerPhone}`;
      customerName = cust[0] ? (cust[0] as { name: string }).name : "Customer";
    }
  }

  const transactions = await getWalletTransactions(customerPhone, 50);

  return NextResponse.json({
    customerName,
    customerPhone,
    balance: wallet?.balance ?? 0,
    bonusBalance: wallet?.bonusBalance ?? 0,
    transactions,
  });
}

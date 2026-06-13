import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { ensureWalletTables, rechargeWallet } from "@/lib/wallet";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { customerPhone, customerName, walletPlanId, creditAmount, bonusAmount, paymentMethod, notes } = await req.json();

  if (!customerPhone || !customerName) {
    return NextResponse.json({ error: "Customer phone and name are required" }, { status: 400 });
  }
  if (!paymentMethod) {
    return NextResponse.json({ error: "Payment method is required" }, { status: 400 });
  }

  await ensureWalletTables();
  const sql = getSql();

  let finalCredit = Number(creditAmount) || 0;
  let finalBonus = Number(bonusAmount) || 0;

  if (walletPlanId) {
    const plan = await sql`SELECT * FROM wallet_plans WHERE id = ${walletPlanId}`;
    if (!plan[0]) return NextResponse.json({ error: "Wallet plan not found" }, { status: 404 });
    const p = plan[0] as Record<string, unknown>;
    finalCredit = Number(p.credit_amount);
    finalBonus = Number(p.bonus_amount);
  }

  if (finalCredit <= 0) {
    return NextResponse.json({ error: "Credit amount must be greater than zero" }, { status: 400 });
  }

  const tx = await rechargeWallet({
    customerPhone,
    customerName,
    creditAmount: finalCredit,
    bonusAmount: finalBonus,
    paymentMethod,
    referenceType: walletPlanId ? "wallet_plan" : "manual",
    referenceId: walletPlanId || null,
    notes: notes || null,
  });

  return NextResponse.json({ transaction: tx }, { status: 201 });
}

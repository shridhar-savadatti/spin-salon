import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import { ensureWalletTables } from "@/lib/wallet";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureWalletTables();
  const sql = getSql();
  const rows = await sql`SELECT * FROM wallet_plans ORDER BY created_at DESC`;
  return NextResponse.json(rows.map((r: Record<string, unknown>) => ({
    id: r.id,
    name: r.name,
    rechargeAmount: Number(r.recharge_amount),
    creditAmount: Number(r.credit_amount),
    bonusAmount: Number(r.bonus_amount),
    isActive: !!r.is_active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  })));
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, rechargeAmount, creditAmount, bonusAmount } = await req.json();

  if (!name || rechargeAmount === undefined || creditAmount === undefined) {
    return NextResponse.json({ error: "Name, recharge amount, and credit amount are required" }, { status: 400 });
  }

  await ensureWalletTables();
  const sql = getSql();
  const id = generateId();
  const now = new Date().toISOString();

  await sql`
    INSERT INTO wallet_plans (id, name, recharge_amount, credit_amount, bonus_amount, is_active, created_at, updated_at)
    VALUES (${id}, ${name}, ${rechargeAmount}, ${creditAmount}, ${bonusAmount || 0}, 1, ${now}, ${now})
  `;

  return NextResponse.json({ id, message: "Plan created" }, { status: 201 });
}

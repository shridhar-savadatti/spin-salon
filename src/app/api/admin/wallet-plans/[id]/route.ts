import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { ensureWalletTables } from "@/lib/wallet";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  await ensureWalletTables();
  const sql = getSql();
  const now = new Date().toISOString();

  if ("isActive" in body && Object.keys(body).length === 1) {
    await sql`UPDATE wallet_plans SET is_active = ${body.isActive ? 1 : 0}, updated_at = ${now} WHERE id = ${id}`;
  } else {
    const { name, rechargeAmount, creditAmount, bonusAmount, isActive } = body;
    await sql`
      UPDATE wallet_plans SET
        name = ${name},
        recharge_amount = ${rechargeAmount},
        credit_amount = ${creditAmount},
        bonus_amount = ${bonusAmount || 0},
        is_active = ${isActive === undefined ? 1 : (isActive ? 1 : 0)},
        updated_at = ${now}
      WHERE id = ${id}
    `;
  }

  return NextResponse.json({ message: "Updated" });
}

import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { ensureWalletTables, refundWallet } from "@/lib/wallet";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { customerPhone, customerName, amount, notes } = await req.json();

  if (!customerPhone || !customerName || !amount || Number(amount) <= 0) {
    return NextResponse.json({ error: "Customer and a positive amount are required" }, { status: 400 });
  }

  await ensureWalletTables();
  const tx = await refundWallet({
    customerPhone,
    customerName,
    amount: Number(amount),
    notes: notes || null,
  });

  return NextResponse.json({ transaction: tx }, { status: 201 });
}

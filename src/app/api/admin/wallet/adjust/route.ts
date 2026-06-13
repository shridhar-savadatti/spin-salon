import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { ensureWalletTables, adjustWallet } from "@/lib/wallet";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { customerPhone, customerName, delta, notes } = await req.json();

  if (!customerPhone || !customerName || !delta || Number(delta) === 0) {
    return NextResponse.json({ error: "Customer and a non-zero adjustment amount are required" }, { status: 400 });
  }
  if (!notes || !String(notes).trim()) {
    return NextResponse.json({ error: "Notes are required for adjustments" }, { status: 400 });
  }

  await ensureWalletTables();
  const tx = await adjustWallet({
    customerPhone,
    customerName,
    delta: Number(delta),
    notes: String(notes).trim(),
  });

  if (!tx) {
    return NextResponse.json({ error: "This adjustment would make the wallet balance negative" }, { status: 400 });
  }

  return NextResponse.json({ transaction: tx }, { status: 201 });
}

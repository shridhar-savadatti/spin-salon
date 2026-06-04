import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { paymentMethod, paid } = await req.json();
  const sql = getSql();

  await sql`
    UPDATE bills SET
      payment_method = COALESCE(${paymentMethod ?? null}, payment_method),
      paid = COALESCE(${paid !== undefined ? (paid ? 1 : 0) : null}, paid)
    WHERE id = ${id}
  `;

  return NextResponse.json({ message: "Updated" });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sql = getSql();
  const rows = await sql`SELECT * FROM bills WHERE id = ${id}`;
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const r = rows[0] as Record<string, unknown>;
  return NextResponse.json({
    id: r.id, billNumber: r.bill_number, customerName: r.customer_name,
    customerPhone: r.customer_phone, servicesJson: r.services_json,
    subtotal: Number(r.subtotal), discountAmount: Number(r.discount_amount),
    discountCode: r.discount_code, gstAmount: Number(r.gst_amount),
    total: Number(r.total), paymentMethod: r.payment_method,
    paid: !!r.paid, date: r.date, time: r.time, staffName: r.staff_name, notes: r.notes ?? null,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { generateId } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    paymentMethod, notes, date, time, staffName,
  } = body;

  if (!appointmentId || !customerName || !total) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sql = getSql();

  // Check if bill already exists for this appointment
  const existing = await sql`SELECT bill_number FROM bills WHERE appointment_id = ${appointmentId}`;
  if (existing[0]) {
    return NextResponse.json({ billNumber: (existing[0] as { bill_number: string }).bill_number, alreadyExists: true });
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
      total, payment_method, paid, notes, date, time, staff_name, created_at
    ) VALUES (
      ${id}, ${appointmentId}, ${billNumber}, ${customerName}, ${customerPhone},
      ${typeof servicesJson === "string" ? servicesJson : JSON.stringify(servicesJson)},
      ${subtotal}, ${discountAmount || 0}, ${discountCode || null}, ${gstAmount},
      ${total}, ${paymentMethod || "cash"}, 1, ${notes || null},
      ${date}, ${time}, ${staffName || null}, ${now}
    )
  `;

  return NextResponse.json({ id, billNumber }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { SERVICES } from "@/lib/services-data";
import { BookingFormData } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const sql = getSql();

  const rows = date
    ? await sql`SELECT * FROM appointments WHERE date = ${date} ORDER BY time ASC`
    : await sql`SELECT * FROM appointments ORDER BY date DESC, time ASC`;

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  try {
    const body: BookingFormData = await req.json();
    const { customerName, customerPhone, serviceId, date, time, notes, staffId, discountCode, discountAmount, finalPrice } = body as typeof body & { discountCode?: string; discountAmount?: number; finalPrice?: number };

    if (!customerName || !customerPhone || !serviceId || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const service = SERVICES.find(s => s.id === serviceId);
    if (!service) return NextResponse.json({ error: "Invalid service" }, { status: 400 });

    const sql = getSql();
    let staffName: string | null = null;
    let resolvedStaffId: string | null = staffId || null;

    if (staffId) {
      const rows = await sql`SELECT name FROM staff WHERE id = ${staffId} AND is_active = 1`;
      if (!rows[0]) return NextResponse.json({ error: "Invalid staff member" }, { status: 400 });
      staffName = (rows[0] as { name: string }).name;

      const conflict = await sql`
        SELECT id FROM appointments WHERE date = ${date} AND time = ${time} AND staff_id = ${staffId} AND status != 'cancelled'
      `;
      if (conflict[0]) return NextResponse.json({ error: `${staffName} is already booked at this time` }, { status: 409 });
    } else {
      const allStaff = await sql`SELECT id, name FROM staff WHERE is_active = 1`;
      const bookedRows = await sql`
        SELECT staff_id FROM appointments WHERE date = ${date} AND time = ${time} AND status != 'cancelled' AND staff_id IS NOT NULL
      `;
      const bookedIds = bookedRows.map((r: Record<string, unknown>) => r.staff_id as string);
      const available = (allStaff as { id: string; name: string }[]).find(s => !bookedIds.includes(s.id));
      if (!available) return NextResponse.json({ error: "No stylists available at this time" }, { status: 409 });
      resolvedStaffId = available.id;
      staffName = available.name;
    }

    const blocked = await sql`
      SELECT id FROM blocked_slots WHERE date = ${date} AND time = ${time} AND (staff_id IS NULL OR staff_id = ${resolvedStaffId})
    `;
    if (blocked[0]) return NextResponse.json({ error: "This time slot is not available" }, { status: 409 });

    const id = generateId();
    const createdAt = new Date().toISOString();

    await sql`
      INSERT INTO appointments (id, customer_name, customer_phone, service_id, service_name, service_price, date, time, notes, status, created_at, staff_id, staff_name, discount_code, discount_amount, final_price)
      VALUES (${id}, ${customerName}, ${customerPhone}, ${serviceId}, ${service.name}, ${service.price}, ${date}, ${time}, ${notes || null}, 'pending', ${createdAt}, ${resolvedStaffId}, ${staffName}, ${discountCode || null}, ${discountAmount || 0}, ${finalPrice || service.price})
    `;

    // Increment offer uses count
    if (discountCode) {
      await sql`UPDATE offers SET uses_count = uses_count + 1 WHERE UPPER(code) = UPPER(${discountCode})`;
    }

    return NextResponse.json({ id, staffName, message: "Appointment booked successfully" }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

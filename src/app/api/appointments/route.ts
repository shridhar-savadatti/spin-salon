import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { SERVICES } from "@/lib/services-data";
import { SelectedService } from "@/types";

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
    const body = await req.json();
    const {
      customerName, customerPhone, date, time, notes, staffId,
      discountCode, discountAmount, finalPrice,
      // Multi-service support
      selectedServices, serviceId,
    } = body as {
      customerName: string; customerPhone: string; date: string; time: string;
      notes?: string; staffId?: string; discountCode?: string;
      discountAmount?: number; finalPrice?: number;
      selectedServices?: SelectedService[]; serviceId?: string;
    };

    if (!customerName || !customerPhone || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Support both multi-service and single-service bookings
    let services: SelectedService[] = [];
    if (selectedServices && selectedServices.length > 0) {
      services = selectedServices;
    } else if (serviceId) {
      const s = SERVICES.find(sv => sv.id === serviceId);
      if (!s) return NextResponse.json({ error: "Invalid service" }, { status: 400 });
      services = [{ id: s.id, name: s.name, price: s.price, duration: s.duration, category: s.category }];
    } else {
      return NextResponse.json({ error: "No services selected" }, { status: 400 });
    }

    const primaryService = services[0];
    const totalPrice = services.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
    const serviceNames = services.map(s => s.name).join(", ");
    const servicesJson = JSON.stringify(services);

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
    const actualFinalPrice = finalPrice ?? totalPrice;

    // Ensure new columns exist (safe on repeated calls)
    try {
      await sql`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS services_json TEXT`;
      await sql`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS total_duration INTEGER DEFAULT 0`;
      await sql`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS discount_code TEXT`;
      await sql`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS discount_amount DECIMAL DEFAULT 0`;
      await sql`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS final_price DECIMAL`;
    } catch { /* already exist */ }

    await sql`
      INSERT INTO appointments (
        id, customer_name, customer_phone, service_id, service_name, service_price,
        date, time, notes, status, created_at, staff_id, staff_name,
        discount_code, discount_amount, final_price, services_json, total_duration
      ) VALUES (
        ${id}, ${customerName}, ${customerPhone}, ${primaryService.id}, ${serviceNames}, ${totalPrice},
        ${date}, ${time}, ${notes || null}, 'pending', ${createdAt}, ${resolvedStaffId}, ${staffName},
        ${discountCode || null}, ${discountAmount || 0}, ${actualFinalPrice}, ${servicesJson}, ${totalDuration}
      )
    `;

    if (discountCode) {
      await sql`UPDATE offers SET uses_count = uses_count + 1 WHERE UPPER(code) = UPPER(${discountCode})`;
    }

    return NextResponse.json({ id, staffName, totalPrice, totalDuration, services, message: "Appointment booked successfully" }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Appointment booking error:", msg);
    // Return the actual error so we can debug
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

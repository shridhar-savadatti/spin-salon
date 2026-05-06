import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { generateId } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const staffId = searchParams.get("staffId");
  const sql = getSql();

  if (!date) {
    const rows = await sql`SELECT * FROM time_slots ORDER BY time ASC`;
    return NextResponse.json(rows.map((s: Record<string, unknown>) => ({
      id: s.id, time: s.time, isAvailable: !!s.is_active,
    })));
  }

  const allSlots = await sql`SELECT * FROM time_slots WHERE is_active = 1 ORDER BY time ASC`;

  let bookedTimes: string[];
  if (staffId) {
    const rows = await sql`
      SELECT time FROM appointments WHERE date = ${date} AND staff_id = ${staffId} AND status != 'cancelled'
    `;
    bookedTimes = rows.map((r: Record<string, unknown>) => r.time as string);
  } else {
    const totalRows = await sql`SELECT COUNT(*) as c FROM staff WHERE is_active = 1`;
    const total = parseInt(totalRows[0].c as string);
    const countRows = await sql`
      SELECT time, COUNT(*) as cnt FROM appointments
      WHERE date = ${date} AND status != 'cancelled' AND staff_id IS NOT NULL GROUP BY time
    `;
    bookedTimes = (countRows as { time: string; cnt: string }[])
      .filter(r => parseInt(r.cnt) >= total).map(r => r.time);
  }

  let blockedTimes: string[];
  if (staffId) {
    const rows = await sql`
      SELECT time FROM blocked_slots WHERE date = ${date} AND (staff_id IS NULL OR staff_id = ${staffId})
    `;
    blockedTimes = rows.map((r: Record<string, unknown>) => r.time as string);
  } else {
    const rows = await sql`SELECT time FROM blocked_slots WHERE date = ${date} AND staff_id IS NULL`;
    blockedTimes = rows.map((r: Record<string, unknown>) => r.time as string);
  }

  const unavailable = new Set([...bookedTimes, ...blockedTimes]);
  return NextResponse.json((allSlots as { id: string; time: string }[]).map(s => ({
    id: s.id, time: s.time, isAvailable: !unavailable.has(s.time),
  })));
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, date, time, slotId, staffId } = await req.json();
  const sql = getSql();

  if (action === "block") {
    const id = generateId();
    await sql`INSERT INTO blocked_slots (id, date, time, staff_id) VALUES (${id}, ${date}, ${time}, ${staffId || null}) ON CONFLICT DO NOTHING`;
    return NextResponse.json({ message: "Slot blocked" });
  }

  if (action === "unblock") {
    if (staffId) {
      await sql`DELETE FROM blocked_slots WHERE date = ${date} AND time = ${time} AND staff_id = ${staffId}`;
    } else {
      await sql`DELETE FROM blocked_slots WHERE date = ${date} AND time = ${time} AND staff_id IS NULL`;
    }
    return NextResponse.json({ message: "Slot unblocked" });
  }

  if (action === "toggle") {
    const rows = await sql`SELECT is_active FROM time_slots WHERE id = ${slotId}`;
    if (!rows[0]) return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    const current = (rows[0] as { is_active: number }).is_active;
    await sql`UPDATE time_slots SET is_active = ${current ? 0 : 1} WHERE id = ${slotId}`;
    return NextResponse.json({ message: "Slot toggled" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getSql();

  // Get today's date in IST (UTC+5:30)
  const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const todayIST = istNow.toISOString().split("T")[0];

  // Find all pending appointments where date is strictly before today IST
  const stale = await sql`
    SELECT id, customer_name, customer_phone, service_name, date, time
    FROM appointments
    WHERE status = 'pending' AND date < ${todayIST}
  ` as {
    id: string;
    customer_name: string;
    customer_phone: string;
    service_name: string;
    date: string;
    time: string;
  }[];

  if (stale.length === 0) {
    return NextResponse.json({ message: "No stale appointments", cancelled: 0 });
  }

  // Cancel them all
  await sql`
    UPDATE appointments
    SET status = 'cancelled'
    WHERE status = 'pending' AND date < ${todayIST}
  `;

  // Log how many were cancelled
  console.log(`[Cron] Auto-cancelled ${stale.length} stale pending appointments for date < ${todayIST}`);

  return NextResponse.json({
    message: `Auto-cancelled ${stale.length} stale pending appointments`,
    cancelled: stale.length,
    appointments: stale.map(a => ({
      id: a.id,
      customer: a.customer_name,
      service: a.service_name,
      date: a.date,
      time: a.time,
    })),
  });
}

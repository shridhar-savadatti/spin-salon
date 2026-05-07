import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = getSql();

  const slots = [
    "08:30","09:00","09:30","10:00","10:30","11:00","11:30",
    "12:00","12:30","13:00","13:30","14:00","14:30",
    "15:00","15:30","16:00","16:30","17:00","17:30",
    "18:00","18:30","19:00","19:30","20:00","20:30","21:00",
  ];

  await sql`DELETE FROM time_slots`;
  for (let i = 0; i < slots.length; i++) {
    await sql`INSERT INTO time_slots (id, time, is_active) VALUES (${`slot-${i + 1}`}, ${slots[i]}, 1)`;
  }

  return NextResponse.json({ message: `Reset complete. ${slots.length} slots created (08:30–21:00)` });
}

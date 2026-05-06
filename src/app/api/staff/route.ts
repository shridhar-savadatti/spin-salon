import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getSql();
  const rows = await sql`SELECT * FROM staff WHERE is_active = 1 ORDER BY name ASC`;
  return NextResponse.json(rows.map((s: Record<string, unknown>) => ({
    id: s.id, name: s.name, role: s.role, isActive: true,
  })));
}

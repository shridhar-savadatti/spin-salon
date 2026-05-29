import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { generateId } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getSql();
  const rows = await sql`SELECT * FROM announcements ORDER BY sort_order ASC, created_at ASC`;
  return NextResponse.json(rows.map((r: Record<string, unknown>) => ({
    id: r.id,
    text: r.text,
    color: r.color,
    isActive: !!r.is_active,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  })));
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text, color, sortOrder } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Text is required" }, { status: 400 });

  const sql = getSql();
  const id = generateId();
  const now = new Date().toISOString();

  await sql`
    INSERT INTO announcements (id, text, color, is_active, sort_order, created_at)
    VALUES (${id}, ${text.trim()}, ${color || "yellow"}, 1, ${sortOrder ?? 0}, ${now})
  `;

  return NextResponse.json({ id, message: "Created" }, { status: 201 });
}

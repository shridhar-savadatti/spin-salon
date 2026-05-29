import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const sql = getSql();

  if ("isActive" in body && Object.keys(body).length === 1) {
    await sql`UPDATE announcements SET is_active = ${body.isActive ? 1 : 0} WHERE id = ${id}`;
  } else {
    const { text, color, sortOrder } = body;
    await sql`
      UPDATE announcements
      SET text = ${text.trim()}, color = ${color}, sort_order = ${sortOrder ?? 0}
      WHERE id = ${id}
    `;
  }

  return NextResponse.json({ message: "Updated" });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sql = getSql();
  await sql`DELETE FROM announcements WHERE id = ${id}`;
  return NextResponse.json({ message: "Deleted" });
}

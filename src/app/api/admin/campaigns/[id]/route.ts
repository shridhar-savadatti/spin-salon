import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const sql = getSql();
  const rows = await sql`SELECT * FROM campaigns WHERE id = ${id}`;
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const r = rows[0] as Record<string, unknown>;
  return NextResponse.json({ id: r.id, name: r.name, messageTemplate: r.message_template, serviceFilter: r.service_filter, weeksSinceVisit: r.weeks_since_visit, status: r.status, totalCustomers: r.total_customers, sentCount: r.sent_count, createdAt: r.created_at, sentAt: r.sent_at });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { sentCount, status } = await req.json();
  const sql = getSql();
  const now = new Date().toISOString();
  if (status === "sent") {
    await sql`UPDATE campaigns SET status='sent', sent_count=${sentCount}, sent_at=${now} WHERE id=${id}`;
  } else {
    await sql`UPDATE campaigns SET sent_count=${sentCount} WHERE id=${id}`;
  }
  return NextResponse.json({ message: "Updated" });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const sql = getSql();
  await sql`DELETE FROM campaigns WHERE id = ${id}`;
  return NextResponse.json({ message: "Deleted" });
}

import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { generateId } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSql();
  const rows = await sql`SELECT * FROM campaigns ORDER BY created_at DESC`;
  return NextResponse.json(rows.map((r: Record<string, unknown>) => ({
    id: r.id, name: r.name, messageTemplate: r.message_template,
    serviceFilter: r.service_filter, weeksSinceVisit: r.weeks_since_visit,
    status: r.status, totalCustomers: r.total_customers,
    sentCount: r.sent_count, createdAt: r.created_at, sentAt: r.sent_at,
  })));
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, messageTemplate, serviceFilter, weeksSinceVisit, totalCustomers } = await req.json();
  if (!name || !messageTemplate) return NextResponse.json({ error: "Name and message required" }, { status: 400 });
  const sql = getSql();
  const id = generateId();
  const now = new Date().toISOString();
  await sql`INSERT INTO campaigns (id, name, message_template, service_filter, weeks_since_visit, status, total_customers, sent_count, created_at) VALUES (${id}, ${name}, ${messageTemplate}, ${serviceFilter || null}, ${weeksSinceVisit || 0}, 'draft', ${totalCustomers || 0}, 0, ${now})`;
  return NextResponse.json({ id, message: "Campaign created" }, { status: 201 });
}

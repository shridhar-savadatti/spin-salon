import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { getAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { page } = await req.json();
  if (!page) return NextResponse.json({ error: "Page required" }, { status: 400 });
  const sql = getSql();
  await sql`INSERT INTO analytics (id, page, visited_at) VALUES (${generateId()}, ${page}, ${new Date().toISOString()})`;
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSql();
  const stats = await sql`SELECT page, COUNT(*) as visits FROM analytics GROUP BY page ORDER BY visits DESC`;
  const total = await sql`SELECT COUNT(*) as c FROM analytics`;
  return NextResponse.json({ total: parseInt(total[0].c as string), byPage: stats });
}

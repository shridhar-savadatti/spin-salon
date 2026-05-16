import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { generateId } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { endpoint, keys } = await req.json();
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const sql = getSql();
  const now = new Date().toISOString();

  await sql`
    INSERT INTO push_subscriptions (id, endpoint, p256dh, auth, created_at)
    VALUES (${generateId()}, ${endpoint}, ${keys.p256dh}, ${keys.auth}, ${now})
    ON CONFLICT (endpoint) DO UPDATE SET p256dh = ${keys.p256dh}, auth = ${keys.auth}
  `;

  return NextResponse.json({ message: "Subscribed to push notifications" });
}

export async function DELETE(req: NextRequest) {
  const { endpoint } = await req.json();
  if (!endpoint) return NextResponse.json({ error: "Endpoint required" }, { status: 400 });

  const sql = getSql();
  await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`;
  return NextResponse.json({ message: "Unsubscribed" });
}

import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const serviceFilter = searchParams.get("service") || "all";
  const weeksSince = parseInt(searchParams.get("weeks") || "0");
  const messageTemplate = searchParams.get("message") || "Hi {name}, we have a special offer for you!";

  const sql = getSql();

  let rows: Record<string, unknown>[];

  if (serviceFilter !== "all" && weeksSince > 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - weeksSince * 7);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    rows = await sql`
      SELECT customer_name, customer_phone, service_name, MAX(date) as last_visit
      FROM appointments WHERE status != 'cancelled'
      AND (service_name ILIKE ${"%" + serviceFilter + "%"} OR service_id ILIKE ${"%" + serviceFilter + "%"})
      GROUP BY customer_phone, customer_name, service_name
      HAVING MAX(date) <= ${cutoffStr}
      ORDER BY last_visit DESC LIMIT 500
    ` as Record<string, unknown>[];
  } else if (serviceFilter !== "all") {
    rows = await sql`
      SELECT customer_name, customer_phone, service_name, MAX(date) as last_visit
      FROM appointments WHERE status != 'cancelled'
      AND (service_name ILIKE ${"%" + serviceFilter + "%"} OR service_id ILIKE ${"%" + serviceFilter + "%"})
      GROUP BY customer_phone, customer_name, service_name
      ORDER BY last_visit DESC LIMIT 500
    ` as Record<string, unknown>[];
  } else if (weeksSince > 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - weeksSince * 7);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    rows = await sql`
      SELECT customer_name, customer_phone, service_name, MAX(date) as last_visit
      FROM appointments WHERE status != 'cancelled'
      GROUP BY customer_phone, customer_name, service_name
      HAVING MAX(date) <= ${cutoffStr}
      ORDER BY last_visit DESC LIMIT 500
    ` as Record<string, unknown>[];
  } else {
    rows = await sql`
      SELECT customer_name, customer_phone, service_name, MAX(date) as last_visit
      FROM appointments WHERE status != 'cancelled'
      GROUP BY customer_phone, customer_name, service_name
      ORDER BY last_visit DESC LIMIT 500
    ` as Record<string, unknown>[];
  }

  const customers = rows.map(r => {
    const message = messageTemplate
      .replace(/\{name\}/g, (r.customer_name as string).split(" ")[0])
      .replace(/\{fullname\}/g, r.customer_name as string)
      .replace(/\{service\}/g, r.service_name as string)
      .replace(/\{salon\}/g, "Spin Unisex Salon");
    const phone = (r.customer_phone as string).replace(/[^0-9]/g, "");
    return {
      name: r.customer_name, phone: r.customer_phone,
      serviceName: r.service_name, lastVisit: r.last_visit,
      message, waLink: `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
    };
  });

  return NextResponse.json({ customers, total: customers.length });
}

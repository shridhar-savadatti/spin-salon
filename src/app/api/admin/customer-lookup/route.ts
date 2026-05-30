import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const phone = new URL(req.url).searchParams.get("phone")?.replace(/\D/g, "") ?? "";
  if (phone.length !== 10) return NextResponse.json({ customer: null });

  const sql = getSql();

  // Check appointments first (most recent visit)
  const appts = await sql`
    SELECT customer_name, MAX(date) as last_visit
    FROM appointments
    WHERE customer_phone = ${phone} AND status != 'cancelled'
    GROUP BY customer_name
    ORDER BY last_visit DESC
    LIMIT 1
  `;

  if (appts[0]) {
    return NextResponse.json({
      customer: {
        name: (appts[0] as { customer_name: string }).customer_name,
        lastVisit: (appts[0] as { last_visit: string }).last_visit,
        source: "appointments",
      },
    });
  }

  // Fall back to imported customers table
  const customers = await sql`
    SELECT name, last_visit FROM customers WHERE phone = ${phone} LIMIT 1
  `;

  if (customers[0]) {
    return NextResponse.json({
      customer: {
        name: (customers[0] as { name: string }).name,
        lastVisit: (customers[0] as { last_visit: string | null }).last_visit,
        source: "imported",
      },
    });
  }

  return NextResponse.json({ customer: null });
}

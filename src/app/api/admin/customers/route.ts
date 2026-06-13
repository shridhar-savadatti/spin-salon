import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { ensureWalletTables } from "@/lib/wallet";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const search = new URL(req.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  const sql = getSql();
  await ensureWalletTables();

  const wallets = await sql`SELECT customer_phone, balance, bonus_balance FROM wallets` as { customer_phone: string; balance: string; bonus_balance: string }[];
  const walletMap = new Map(wallets.map(w => [w.customer_phone, Number(w.balance) + Number(w.bonus_balance)]));

  // Customers from appointments (with visit count)
  const fromAppts = await sql`
    SELECT
      customer_name  AS name,
      customer_phone AS phone,
      COUNT(*)       AS visit_count,
      MAX(date)      AS last_visit,
      'appointment'  AS source
    FROM appointments
    WHERE status != 'cancelled'
    GROUP BY customer_phone, customer_name
    ORDER BY last_visit DESC
  ` as { name: string; phone: string; visit_count: string; last_visit: string; source: string }[];

  // Imported customers not already in appointments
  const apptPhones = new Set(fromAppts.map(r => r.phone));

  const fromImported = await sql`
    SELECT name, phone, last_visit, 'imported' AS source
    FROM customers
    ORDER BY last_visit DESC
  ` as { name: string; phone: string; last_visit: string | null; source: string }[];

  const importedFiltered = fromImported.filter(r => !apptPhones.has(r.phone));

  const all = [
    ...fromAppts.map(r => ({
      name: r.name,
      phone: r.phone,
      visitCount: parseInt(r.visit_count),
      lastVisit: r.last_visit,
      source: r.source,
      walletBalance: walletMap.get(r.phone) ?? 0,
    })),
    ...importedFiltered.map(r => ({
      name: r.name,
      phone: r.phone,
      visitCount: 0,
      lastVisit: r.last_visit ?? null,
      source: r.source,
      walletBalance: walletMap.get(r.phone) ?? 0,
    })),
  ];

  const filtered = search
    ? all.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.phone.includes(search)
      )
    : all;

  return NextResponse.json({ customers: filtered, total: all.length });
}

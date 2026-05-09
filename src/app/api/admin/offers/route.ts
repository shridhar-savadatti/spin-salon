import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { generateId } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSql();
  const rows = await sql`SELECT * FROM offers ORDER BY created_at DESC`;
  return NextResponse.json(rows.map((r: Record<string, unknown>) => ({
    id: r.id, code: r.code, description: r.description,
    discountType: r.discount_type, discountValue: r.discount_value,
    minOrder: r.min_order, validFor: r.valid_for, categoryFilter: r.category_filter,
    maxUses: r.max_uses, usesCount: r.uses_count, expiresAt: r.expires_at,
    isActive: !!r.is_active, createdAt: r.created_at,
  })));
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code, description, discountType, discountValue, minOrder, validFor, categoryFilter, maxUses, expiresAt } = await req.json();

  if (!code || !discountValue) {
    return NextResponse.json({ error: "Code and discount value required" }, { status: 400 });
  }

  const sql = getSql();

  // Check duplicate code
  const existing = await sql`SELECT id FROM offers WHERE UPPER(code) = UPPER(${code})`;
  if (existing[0]) return NextResponse.json({ error: "Code already exists" }, { status: 409 });

  const id = generateId();
  const now = new Date().toISOString();

  await sql`
    INSERT INTO offers (id, code, description, discount_type, discount_value, min_order, valid_for, category_filter, max_uses, uses_count, expires_at, is_active, created_at)
    VALUES (${id}, ${code.toUpperCase()}, ${description || null}, ${discountType || "percentage"}, ${discountValue}, ${minOrder || 0}, ${validFor || "all"}, ${categoryFilter || null}, ${maxUses || null}, 0, ${expiresAt || null}, 1, ${now})
  `;

  return NextResponse.json({ id, message: "Offer created" }, { status: 201 });
}

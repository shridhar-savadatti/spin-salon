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

  if ("isActive" in body) {
    await sql`UPDATE offers SET is_active = ${body.isActive ? 1 : 0} WHERE id = ${id}`;
  } else {
    const { code, description, discountType, discountValue, minOrder, validFor, categoryFilter, maxUses, expiresAt } = body;
    await sql`
      UPDATE offers SET
        code = ${code.toUpperCase()}, description = ${description || null},
        discount_type = ${discountType}, discount_value = ${discountValue},
        min_order = ${minOrder || 0}, valid_for = ${validFor},
        category_filter = ${categoryFilter || null}, max_uses = ${maxUses || null},
        expires_at = ${expiresAt || null}
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
  await sql`DELETE FROM offers WHERE id = ${id}`;
  return NextResponse.json({ message: "Deleted" });
}

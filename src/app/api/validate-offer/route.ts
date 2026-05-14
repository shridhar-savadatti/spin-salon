import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { code, phone, servicePrice, category } = await req.json();

  if (!code || !phone || !servicePrice) {
    return NextResponse.json({ error: "Code, phone and service price required" }, { status: 400 });
  }

  const sql = getSql();

  // Find offer
  const rows = await sql`SELECT * FROM offers WHERE UPPER(code) = UPPER(${code}) AND is_active = 1`;
  const offer = rows[0] as Record<string, unknown> | undefined;

  if (!offer) {
    return NextResponse.json({ error: "Invalid or inactive promo code" }, { status: 404 });
  }

  // Check expiry
  if (offer.expires_at && new Date(offer.expires_at as string) < new Date()) {
    return NextResponse.json({ error: "This promo code has expired" }, { status: 400 });
  }

  // Check max uses
  if (offer.max_uses !== null && (offer.uses_count as number) >= (offer.max_uses as number)) {
    return NextResponse.json({ error: "This promo code has reached its usage limit" }, { status: 400 });
  }

  // Check min order
  if (servicePrice < parseFloat(offer.min_order as string)) {
    return NextResponse.json({
      error: `This code is valid only on services above ₹${offer.min_order} (before GST)`,
    }, { status: 400 });
  }

  // Check category filter
  if (offer.category_filter && category && offer.category_filter !== category) {
    return NextResponse.json({
      error: `This code is valid only for ${offer.category_filter} services`,
    }, { status: 400 });
  }

  // Check new customer eligibility
  if (offer.valid_for === "new") {
    const existing = await sql`
      SELECT COUNT(*) as c FROM appointments
      WHERE customer_phone = ${phone} AND status != 'cancelled'
    `;
    const count = parseInt((existing[0] as { c: string }).c);
    if (count > 0) {
      return NextResponse.json({
        error: "This code is for new customers only",
      }, { status: 400 });
    }
  }

  // Calculate discount
  let discountAmount = 0;
  if (offer.discount_type === "percentage") {
    discountAmount = Math.round((servicePrice * (offer.discount_value as number)) / 100);
  } else {
    discountAmount = Math.min(offer.discount_value as number, servicePrice);
  }

  const finalPrice = servicePrice - discountAmount;

  return NextResponse.json({
    valid: true,
    code: (offer.code as string).toUpperCase(),
    description: offer.description,
    discountType: offer.discount_type,
    discountValue: offer.discount_value,
    discountAmount,
    finalPrice,
  });
}

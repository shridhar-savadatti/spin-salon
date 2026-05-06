import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getSql();
  const rows = await sql`
    SELECT id, title, slug, excerpt, cover_image, published_at, created_at
    FROM blog_posts WHERE published = 1 ORDER BY published_at DESC
  `;
  return NextResponse.json(rows.map((r: Record<string, unknown>) => ({
    id: r.id, title: r.title, slug: r.slug, excerpt: r.excerpt,
    coverImage: r.cover_image, publishedAt: r.published_at, createdAt: r.created_at,
  })));
}

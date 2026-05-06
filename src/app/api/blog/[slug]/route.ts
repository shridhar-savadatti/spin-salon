import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sql = getSql();
  const rows = await sql`SELECT * FROM blog_posts WHERE slug = ${slug} AND published = 1`;
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const r = rows[0] as Record<string, unknown>;
  return NextResponse.json({
    id: r.id, title: r.title, slug: r.slug, excerpt: r.excerpt, content: r.content,
    coverImage: r.cover_image, publishedAt: r.published_at,
    createdAt: r.created_at, updatedAt: r.updated_at,
  });
}

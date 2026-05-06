import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { generateId } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSql();
  const rows = await sql`SELECT id, title, slug, excerpt, cover_image, published, published_at, created_at, updated_at FROM blog_posts ORDER BY created_at DESC`;
  return NextResponse.json(rows.map((r: Record<string, unknown>) => ({
    id: r.id, title: r.title, slug: r.slug, excerpt: r.excerpt,
    coverImage: r.cover_image, published: !!r.published,
    publishedAt: r.published_at, createdAt: r.created_at, updatedAt: r.updated_at,
  })));
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, slug, excerpt, content, coverImage, published } = await req.json();
  if (!title || !slug || !content) return NextResponse.json({ error: "Title, slug and content required" }, { status: 400 });
  const sql = getSql();
  const id = generateId();
  const now = new Date().toISOString();
  const publishedAt = published ? now : null;
  await sql`
    INSERT INTO blog_posts (id, title, slug, excerpt, content, cover_image, published, published_at, created_at, updated_at)
    VALUES (${id}, ${title}, ${slug}, ${excerpt || null}, ${content}, ${coverImage || null}, ${published ? 1 : 0}, ${publishedAt}, ${now}, ${now})
  `;
  return NextResponse.json({ id, message: "Post created" }, { status: 201 });
}

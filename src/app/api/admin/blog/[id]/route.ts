import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const sql = getSql();
  const rows = await sql`SELECT * FROM blog_posts WHERE id = ${id}`;
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const r = rows[0] as Record<string, unknown>;
  return NextResponse.json({ id: r.id, title: r.title, slug: r.slug, excerpt: r.excerpt, content: r.content, coverImage: r.cover_image, published: !!r.published, publishedAt: r.published_at, createdAt: r.created_at, updatedAt: r.updated_at });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { title, slug, excerpt, content, coverImage, published } = await req.json();
  if (!title || !slug || !content) return NextResponse.json({ error: "Title, slug and content required" }, { status: 400 });
  const sql = getSql();
  const now = new Date().toISOString();
  const existing = await sql`SELECT published, published_at FROM blog_posts WHERE id = ${id}`;
  if (!existing[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const ex = existing[0] as { published: number; published_at: string | null };
  const publishedAt = published && !ex.published ? now : ex.published_at;
  await sql`UPDATE blog_posts SET title=${title}, slug=${slug}, excerpt=${excerpt || null}, content=${content}, cover_image=${coverImage || null}, published=${published ? 1 : 0}, published_at=${publishedAt}, updated_at=${now} WHERE id=${id}`;
  return NextResponse.json({ message: "Post updated" });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const sql = getSql();
  await sql`DELETE FROM blog_posts WHERE id = ${id}`;
  return NextResponse.json({ message: "Post deleted" });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { published } = await req.json();
  const sql = getSql();
  const now = new Date().toISOString();
  await sql`UPDATE blog_posts SET published=${published ? 1 : 0}, published_at=${published ? now : null}, updated_at=${now} WHERE id=${id}`;
  return NextResponse.json({ message: "Post updated" });
}

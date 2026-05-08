import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSql } from "@/lib/db";
import { Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const d = new Date(iso);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function renderContent(content: string): React.ReactNode[] {
  return content.split(/\n\n+/).map((block, i) => {
    const t = block.trim();
    if (!t) return null;
    if (t.startsWith("# ")) return <h2 key={i} className="mt-8 mb-3 text-2xl font-extrabold text-zinc-900">{t.slice(2)}</h2>;
    if (t.startsWith("## ")) return <h3 key={i} className="mt-6 mb-2 text-xl font-bold text-zinc-900">{t.slice(3)}</h3>;
    if (t.startsWith("### ")) return <h4 key={i} className="mt-5 mb-2 text-lg font-bold text-zinc-800">{t.slice(4)}</h4>;
    const lines = t.split("\n");
    if (lines.every(l => l.startsWith("- "))) {
      return <ul key={i} className="my-4 ml-4 list-disc space-y-1 text-zinc-600">{lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>;
    }
    return <p key={i} className="my-4 leading-relaxed text-zinc-600">{t}</p>;
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const sql = getSql();
  const rows = await sql`SELECT title, excerpt FROM blog_posts WHERE slug = ${slug} AND published = 1`;
  if (!rows[0]) return { title: "Post Not Found" };
  const r = rows[0] as { title: string; excerpt: string };
  return { title: r.title, description: r.excerpt, alternates: { canonical: `https://www.spinkudlu.com/blog/${slug}` } };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sql = getSql();
  const rows = await sql`SELECT * FROM blog_posts WHERE slug = ${slug} AND published = 1`;
  if (!rows[0]) notFound();
  const post = rows[0] as Record<string, unknown>;

  const related = await sql`
    SELECT id, title, slug, excerpt, published_at FROM blog_posts
    WHERE published = 1 AND slug != ${slug} ORDER BY published_at DESC LIMIT 2
  ` as { id: string; title: string; slug: string; excerpt: string; published_at: string }[];

  return (
    <>
      {post.cover_image && (
        <div className="relative h-72 w-full overflow-hidden sm:h-96">
          <img src={post.cover_image as string} alt={post.title as string} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
      <div className={`bg-white px-4 ${post.cover_image ? "pt-10" : "pt-32"} pb-20`}>
        <div className="mx-auto max-w-2xl">
          <Link href="/blog" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-900 transition">
            <ArrowLeft size={14} /> Back to Blog
          </Link>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-zinc-900 sm:text-4xl">{post.title as string}</h1>
          <div className="mt-4 flex items-center gap-3 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5"><Calendar size={13} /> {formatDate(post.published_at as string)}</span>
            <span>·</span><span>Spin Unisex Salon, Kudlu</span>
          </div>
          {post.excerpt ? <p className="mt-4 text-lg leading-relaxed text-zinc-500 border-l-4 border-zinc-900 pl-4">{post.excerpt as string}</p> : null}
          <div className="mt-8"><div suppressHydrationWarning>{renderContent(post.content as string)}</div></div>
          <div className="mt-12 rounded-2xl bg-zinc-900 p-6 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">Ready to try it?</p>
            <h3 className="mb-4 text-xl font-extrabold text-white">Book at Spin Unisex Salon, Kudlu</h3>
            <Link href="/booking"><Button variant="light">Book Now <ArrowRight size={15} /></Button></Link>
          </div>
          {related.length > 0 && (
            <div className="mt-14">
              <h3 className="mb-6 text-lg font-extrabold text-zinc-900">More from the Blog</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map(r => (
                  <Link key={r.id} href={`/blog/${r.slug}`} className="group rounded-xl border border-zinc-200 p-5 transition hover:border-zinc-900 hover:shadow-md">
                    <h4 className="font-bold text-zinc-900 group-hover:text-zinc-600 transition">{r.title}</h4>
                    {r.excerpt && <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{r.excerpt}</p>}
                    <p className="mt-3 flex items-center gap-1 text-xs text-zinc-400"><Calendar size={11} />{formatDate(r.published_at)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

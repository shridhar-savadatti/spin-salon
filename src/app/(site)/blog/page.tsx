import type { Metadata } from "next";
import Link from "next/link";
import { getSql } from "@/lib/db";
import { Calendar, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Hair care tips, beauty advice, and salon news from Spin Unisex Salon, Kudlu Bengaluru.",
  alternates: { canonical: "https://www.spinkudlu.com/blog" },
};

function formatDate(iso: string) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const d = new Date(iso);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default async function BlogPage() {
  const sql = getSql();
  const posts = await sql`
    SELECT id, title, slug, excerpt, cover_image, published_at
    FROM blog_posts WHERE published = 1 ORDER BY published_at DESC
  ` as { id: string; title: string; slug: string; excerpt: string; cover_image: string | null; published_at: string }[];

  return (
    <>
      <div className="bg-zinc-900 px-4 pt-32 pb-20 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">Tips & Inspiration</p>
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Our Blog</h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">Hair care tips, beauty trends, and salon news from Spin Unisex Salon, Kudlu.</p>
      </div>
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-4xl">
          {posts.length === 0 ? (
            <p className="py-24 text-center text-zinc-400">No posts yet — check back soon!</p>
          ) : (
            <div className="space-y-10">
              {posts.map((post, i) => (
                <Link key={post.id} href={`/blog/${post.slug}`}
                  className={`group flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-900 hover:shadow-lg sm:flex-row ${i === 0 ? "sm:flex-col" : ""}`}>
                  {post.cover_image && (
                    <div className={`overflow-hidden rounded-xl bg-zinc-100 ${i === 0 ? "h-64 w-full" : "h-32 w-40 shrink-0"}`}>
                      <img src={post.cover_image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="flex flex-col justify-center">
                    {i === 0 && <span className="mb-3 inline-block rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">Latest</span>}
                    <h2 className={`font-extrabold text-zinc-900 transition group-hover:text-zinc-600 ${i === 0 ? "text-2xl sm:text-3xl" : "text-lg"}`}>{post.title}</h2>
                    {post.excerpt && <p className="mt-2 text-sm leading-relaxed text-zinc-500 line-clamp-2">{post.excerpt}</p>}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-zinc-400"><Calendar size={12} />{formatDate(post.published_at)}</span>
                      <span className="flex items-center gap-1 text-sm font-semibold text-zinc-900 transition-all group-hover:gap-2">Read more <ArrowRight size={14} /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { BlogPost } from "@/types";
import { PlusCircle, Edit2, Trash2, Eye, EyeOff, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/blog", { cache: "no-store" });
    if (res.ok) setPosts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const togglePublish = async (post: BlogPost) => {
    setToggling(post.id);
    await fetch(`/api/admin/blog/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !post.published }),
    });
    await fetchPosts();
    setToggling(null);
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(id);
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    await fetchPosts();
    setDeleting(null);
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900">Blog Posts</h1>
            <p className="mt-0.5 text-sm text-zinc-500">{posts.filter(p => p.published).length} published · {posts.filter(p => !p.published).length} drafts</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={fetchPosts} className="gap-2">
              <RefreshCw size={14} /> Refresh
            </Button>
            <Link href="/admin/blog/new">
              <Button size="sm" className="gap-2"><PlusCircle size={15} /> New Post</Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-zinc-400">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 py-20 text-center">
            <p className="mb-4 text-zinc-400">No blog posts yet.</p>
            <Link href="/admin/blog/new">
              <Button className="gap-2"><PlusCircle size={15} /> Write your first post</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50">
                <tr>
                  {["Title", "Status", "Published", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-zinc-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-zinc-900">{post.title}</p>
                      {post.excerpt && <p className="mt-0.5 text-xs text-zinc-400 line-clamp-1">{post.excerpt}</p>}
                      <p className="mt-0.5 text-xs text-zinc-300">/{post.slug}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${post.published ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-500">
                      {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => togglePublish(post)} disabled={toggling === post.id}
                          title={post.published ? "Unpublish" : "Publish"}
                          className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50">
                          {post.published ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <Link href={`/admin/blog/${post.id}`}
                          className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700">
                          <Edit2 size={15} />
                        </Link>
                        {post.published && (
                          <Link href={`/blog/${post.slug}`} target="_blank"
                            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700">
                            <Eye size={15} />
                          </Link>
                        )}
                        <button onClick={() => deletePost(post.id)} disabled={deleting === post.id}
                          className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

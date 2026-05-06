"use client";

import { useState, useEffect, useCallback } from "react";
import AdminNav from "@/components/admin/AdminNav";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ArrowLeft, Wand2 } from "lucide-react";
import Link from "next/link";

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function NewBlogPostPage() {
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", coverImage: "", published: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugManual, setSlugManual] = useState(false);


  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManual && form.title) {
      setForm(f => ({ ...f, slug: toSlug(f.title) }));
    }
  }, [form.title, slugManual]);

  const handleSave = async (publish: boolean) => {
    if (!form.title || !form.content) { setError("Title and content are required."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, published: publish }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      window.location.href = "/admin/blog";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="flex-1 p-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin/blog" className="text-zinc-400 hover:text-zinc-700 transition">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-extrabold text-zinc-900">New Blog Post</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main editor */}
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <Input label="Title" id="title" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. How to maintain balayage at home" />

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-700">Slug (URL)</label>
                  <button onClick={() => { setSlugManual(false); setForm(f => ({ ...f, slug: toSlug(f.title) })); }}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700">
                    <Wand2 size={11} /> Auto-generate
                  </button>
                </div>
                <input value={form.slug}
                  onChange={e => { setSlugManual(true); setForm({ ...form, slug: e.target.value }); }}
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 transition focus:border-zinc-900 focus:outline-none"
                  placeholder="post-url-slug" />
                <p className="mt-1 text-xs text-zinc-400">spinkudlu.com/blog/{form.slug || "your-slug"}</p>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Excerpt (shown in blog list)</label>
                <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={2}
                  placeholder="A short summary of this post..."
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-zinc-900 focus:outline-none" />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-700">Content</label>
                <span className="text-xs text-zinc-400">Supports # Heading, ## Subheading, **bold**, - list items</span>
              </div>
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={20}
                placeholder={`# Your First Heading\n\nWrite your content here. Use # for headings, **text** for bold, and - for bullet points.\n\n## Subheading\n\nAnother paragraph here...`}
                className="w-full rounded-xl border-2 border-zinc-200 px-4 py-3 font-mono text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-zinc-900 focus:outline-none" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-zinc-900">Publish</h3>
              {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
              <div className="space-y-3">
                <Button className="w-full" loading={saving} onClick={() => handleSave(true)}>
                  Publish Now
                </Button>
                <Button variant="outline" className="w-full" onClick={() => handleSave(false)}>
                  Save as Draft
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-zinc-900">Cover Image</h3>
              <Input label="" id="coverImage" value={form.coverImage}
                onChange={e => setForm({ ...form, coverImage: e.target.value })}
                placeholder="https://... or /images/..." />
              <p className="mt-1.5 text-xs text-zinc-400">Paste an image URL or a path from /public/images/</p>
              {form.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.coverImage} alt="Cover preview" className="mt-3 w-full rounded-xl object-cover h-32" />
              )}
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-bold text-zinc-900">Formatting Guide</h3>
              <div className="space-y-1.5 text-xs text-zinc-500 font-mono">
                <p># Heading 1</p>
                <p>## Heading 2</p>
                <p>**bold text**</p>
                <p>- bullet point</p>
                <p className="font-sans text-zinc-400 mt-2">Separate paragraphs with a blank line.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

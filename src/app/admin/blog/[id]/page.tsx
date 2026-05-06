"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ArrowLeft, Wand2 } from "lucide-react";
import Link from "next/link";

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function EditBlogPostPage() {
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", coverImage: "", published: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugManual, setSlugManual] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/blog/${id}`).then(r => r.json()).then(data => {
      setForm({
        title: data.title || "",
        slug: data.slug || "",
        excerpt: data.excerpt || "",
        content: data.content || "",
        coverImage: data.coverImage || "",
        published: !!data.published,
      });
      setLoading(false);
    });
  }, [id]);

  const handleSave = async (publish?: boolean) => {
    if (!form.title || !form.content) { setError("Title and content are required."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, published: publish !== undefined ? publish : form.published }),
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-zinc-50">
        <AdminNav />
        <div className="flex-1 flex items-center justify-center text-zinc-400">Loading post...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="flex-1 p-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin/blog" className="text-zinc-400 hover:text-zinc-700 transition">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-extrabold text-zinc-900">Edit Post</h1>
          <span className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${form.published ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
            {form.published ? "Published" : "Draft"}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <Input label="Title" id="title" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} />

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-700">Slug (URL)</label>
                  <button onClick={() => { setSlugManual(false); setForm(f => ({ ...f, slug: toSlug(f.title) })); }}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700">
                    <Wand2 size={11} /> Regenerate
                  </button>
                </div>
                <input value={form.slug}
                  onChange={e => { setSlugManual(true); setForm({ ...form, slug: e.target.value }); }}
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 transition focus:border-zinc-900 focus:outline-none" />
                <p className="mt-1 text-xs text-zinc-400">spinkudlu.com/blog/{form.slug}</p>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Excerpt</label>
                <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={2}
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-zinc-900 focus:outline-none" />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <label className="mb-2 block text-sm font-medium text-zinc-700">Content</label>
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={20}
                className="w-full rounded-xl border-2 border-zinc-200 px-4 py-3 font-mono text-sm text-zinc-900 transition focus:border-zinc-900 focus:outline-none" />
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-zinc-900">Actions</h3>
              {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
              <div className="space-y-3">
                <Button className="w-full" loading={saving} onClick={() => handleSave()}>
                  Save Changes
                </Button>
                {!form.published ? (
                  <Button variant="outline" className="w-full" onClick={() => handleSave(true)}>
                    Publish
                  </Button>
                ) : (
                  <Button variant="ghost" className="w-full" onClick={() => handleSave(false)}>
                    Unpublish (to Draft)
                  </Button>
                )}
                {form.published && (
                  <Link href={`/blog/${form.slug}`} target="_blank"
                    className="block text-center text-sm text-zinc-400 hover:text-zinc-700 transition">
                    View live post →
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-zinc-900">Cover Image</h3>
              <Input label="" id="coverImage" value={form.coverImage}
                onChange={e => setForm({ ...form, coverImage: e.target.value })}
                placeholder="https://... or /images/..." />
              {form.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.coverImage} alt="Cover preview" className="mt-3 w-full rounded-xl object-cover h-32" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import AdminNav from "@/components/admin/AdminNav";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PlusCircle, Trash2, ToggleLeft, ToggleRight, Megaphone, GripVertical } from "lucide-react";

type Announcement = {
  id: string;
  text: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
};

const COLOR_OPTIONS = [
  { value: "yellow", label: "Yellow", cls: "bg-yellow-300" },
  { value: "pink", label: "Pink", cls: "bg-pink-300" },
  { value: "green", label: "Green", cls: "bg-green-300" },
  { value: "blue", label: "Blue", cls: "bg-blue-300" },
  { value: "purple", label: "Purple", cls: "bg-purple-300" },
  { value: "orange", label: "Orange", cls: "bg-orange-300" },
];

const COLOR_TEXT: Record<string, string> = {
  yellow: "text-yellow-300",
  pink: "text-pink-300",
  green: "text-green-300",
  blue: "text-blue-300",
  purple: "text-purple-300",
  orange: "text-orange-300",
};

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [form, setForm] = useState({ text: "", color: "yellow", link: "" });
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/announcements", { cache: "no-store" });
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm({ text: "", color: "yellow", link: "" });
    setFormError("");
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.text.trim()) { setFormError("Text is required."); return; }
    setSaving(true);
    setFormError("");
    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: form.text, color: form.color, link: form.link || null, sortOrder: items.length }),
    });
    if (!res.ok) {
      const data = await res.json();
      setFormError(data.error || "Failed to save");
    } else {
      resetForm();
      load();
    }
    setSaving(false);
  };

  const toggleItem = async (id: string, isActive: boolean) => {
    setToggling(id);
    await fetch(`/api/admin/announcements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    await load();
    setToggling(null);
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this announcement? This cannot be undone.")) return;
    await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Announcement Bar</h1>
              <p className="text-sm text-zinc-500 mt-1">Manage the scrolling offers shown at the top of the site</p>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <PlusCircle size={16} className="mr-2" /> Add Announcement
              </Button>
            )}
          </div>

          {/* Add form */}
          {showForm && (
            <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-zinc-800">New Announcement</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Offer text</label>
                  <Input
                    value={form.text}
                    onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                    placeholder="e.g. Permanent Blowdry for any hair length — ₹4,999 only"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Highlight color</label>
                  <div className="flex gap-3">
                    {COLOR_OPTIONS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setForm(f => ({ ...f, color: c.value }))}
                        className={`flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-xs font-medium transition ${
                          form.color === c.value ? "border-zinc-800 bg-zinc-100" : "border-zinc-200 hover:border-zinc-400"
                        }`}
                      >
                        <span className={`h-3 w-3 rounded-full ${c.cls}`} />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                    Link <span className="text-zinc-400 font-normal">(optional — where clicking takes the user)</span>
                  </label>
                  <Input
                    value={form.link}
                    onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                    placeholder="e.g. /booking?service=w-permanent-blowdry"
                  />
                </div>

                {/* Preview */}
                {form.text && (
                  <div className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold">
                    <span className={COLOR_TEXT[form.color]}>{form.text}</span>
                  </div>
                )}

                {formError && <p className="text-sm text-red-500">{formError}</p>}
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                  </Button>
                  <Button variant="ghost" onClick={resetForm}>Cancel</Button>
                </div>
              </div>
            </div>
          )}

          {/* List */}
          {loading ? (
            <p className="text-sm text-zinc-400">Loading…</p>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center">
              <Megaphone className="mx-auto mb-3 text-zinc-400" size={32} />
              <p className="text-sm font-medium text-zinc-500">No announcements yet</p>
              <p className="mt-1 text-xs text-zinc-400">Add one to show it in the scrolling bar on the homepage</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition ${
                    item.isActive ? "border-zinc-200" : "border-zinc-100 opacity-50"
                  }`}
                >
                  <GripVertical size={16} className="shrink-0 text-zinc-300" />
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full bg-${item.color}-300`} />
                  <p className={`flex-1 text-sm font-medium ${item.isActive ? "text-zinc-800" : "text-zinc-400 line-through"}`}>
                    {item.text}
                  </p>
                  <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${
                    item.isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
                  }`}>
                    {item.isActive ? "Live" : "Off"}
                  </span>
                  <button
                    onClick={() => toggleItem(item.id, item.isActive)}
                    disabled={toggling === item.id}
                    className="shrink-0 text-zinc-400 hover:text-zinc-700 transition"
                    title={item.isActive ? "Disable" : "Enable"}
                  >
                    {item.isActive ? <ToggleRight size={22} className="text-green-500" /> : <ToggleLeft size={22} />}
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="shrink-0 text-zinc-400 hover:text-red-500 transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <p className="mt-4 text-xs text-zinc-400">
              {items.filter(i => i.isActive).length} of {items.length} announcements are live
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

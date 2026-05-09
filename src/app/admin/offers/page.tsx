"use client";

import { useState, useEffect, useCallback } from "react";
import AdminNav from "@/components/admin/AdminNav";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Offer } from "@/types";
import { SERVICE_CATEGORIES } from "@/lib/services-data";
import { PlusCircle, Trash2, ToggleLeft, ToggleRight, Tag, RefreshCw } from "lucide-react";

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "", description: "", discountType: "percentage",
    discountValue: "", minOrder: "2000", validFor: "all",
    categoryFilter: "", maxUses: "", expiresAt: "",
  });
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/offers", { cache: "no-store" });
    if (res.ok) setOffers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm({ code: "", description: "", discountType: "percentage", discountValue: "", minOrder: "2000", validFor: "all", categoryFilter: "", maxUses: "", expiresAt: "" });
    setFormError("");
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.code || !form.discountValue) { setFormError("Code and discount value are required."); return; }
    setSaving(true);
    setFormError("");
    const res = await fetch("/api/admin/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code.toUpperCase(),
        description: form.description,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrder: parseFloat(form.minOrder) || 0,
        validFor: form.validFor,
        categoryFilter: form.categoryFilter || null,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setFormError(data.error || "Failed to create offer"); }
    else { resetForm(); load(); }
    setSaving(false);
  };

  const toggleOffer = async (id: string, isActive: boolean) => {
    setToggling(id);
    await fetch(`/api/admin/offers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    await load();
    setToggling(null);
  };

  const deleteOffer = async (id: string, code: string) => {
    if (!confirm(`Delete offer "${code}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/offers/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="flex-1 p-4 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900">Promo Offers</h1>
            <p className="mt-0.5 text-sm text-zinc-500">Create discount codes for customers</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={load} className="gap-2"><RefreshCw size={14} /></Button>
            <Button size="sm" className="gap-2" onClick={() => setShowForm(true)}>
              <PlusCircle size={15} /> New Offer
            </Button>
          </div>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 font-bold text-zinc-900">Create New Offer</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Promo Code *</label>
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="WELCOME20"
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 font-mono text-sm font-bold uppercase text-zinc-900 focus:border-zinc-900 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Description</label>
                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="20% off for new customers"
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Discount Type</label>
                <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none">
                  <option value="percentage">Percentage (% off)</option>
                  <option value="flat">Flat Amount (₹ off)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Discount Value * {form.discountType === "percentage" ? "(e.g. 20 for 20%)" : "(e.g. 200 for ₹200 off)"}
                </label>
                <input type="number" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })}
                  placeholder={form.discountType === "percentage" ? "20" : "200"}
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Minimum Order (₹)</label>
                <input type="number" value={form.minOrder} onChange={e => setForm({ ...form, minOrder: e.target.value })}
                  placeholder="2000"
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Valid For</label>
                <select value={form.validFor} onChange={e => setForm({ ...form, validFor: e.target.value })}
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none">
                  <option value="all">All Customers</option>
                  <option value="new">New Customers Only (first booking)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Category (optional — leave blank for all)</label>
                <select value={form.categoryFilter} onChange={e => setForm({ ...form, categoryFilter: e.target.value })}
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none">
                  <option value="">All Services</option>
                  {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Max Uses (optional)</label>
                <input type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })}
                  placeholder="100 (leave blank for unlimited)"
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Expiry Date (optional)</label>
                <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none" />
              </div>
            </div>
            {formError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}
            <div className="mt-5 flex gap-3">
              <Button variant="ghost" onClick={resetForm} className="flex-1">Cancel</Button>
              <Button loading={saving} onClick={handleSave} className="flex-1">Create Offer</Button>
            </div>
          </div>
        )}

        {/* Offers list */}
        {loading ? (
          <div className="py-20 text-center text-zinc-400">Loading offers...</div>
        ) : offers.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 py-20 text-center">
            <Tag size={32} className="mx-auto mb-4 text-zinc-300" />
            <p className="mb-2 font-semibold text-zinc-600">No offers yet</p>
            <p className="mb-6 text-sm text-zinc-400">Create your first promo code to give discounts to customers</p>
            <Button onClick={() => setShowForm(true)} className="gap-2"><PlusCircle size={15} /> Create First Offer</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map(o => (
              <div key={o.id} className={`rounded-2xl border bg-white p-5 shadow-sm transition ${o.isActive ? "border-zinc-200" : "border-zinc-100 opacity-60"}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="rounded-lg bg-zinc-900 px-3 py-1 font-mono text-sm font-bold text-white">{o.code}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${o.isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                        {o.isActive ? "Active" : "Inactive"}
                      </span>
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                        {o.discountType === "percentage" ? `${o.discountValue}% off` : `₹${o.discountValue} off`}
                      </span>
                    </div>
                    {o.description && <p className="text-sm text-zinc-600 mb-2">{o.description}</p>}
                    <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
                      <span>Min order: ₹{o.minOrder}</span>
                      <span>Valid for: {o.validFor === "new" ? "New customers only" : "All customers"}</span>
                      {o.categoryFilter && <span>Category: {o.categoryFilter}</span>}
                      {o.maxUses && <span>Uses: {o.usesCount}/{o.maxUses}</span>}
                      {!o.maxUses && <span>Uses: {o.usesCount} (unlimited)</span>}
                      {o.expiresAt && <span>Expires: {new Date(o.expiresAt).toLocaleDateString("en-IN")}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleOffer(o.id, o.isActive)} disabled={toggling === o.id}
                      className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 disabled:opacity-50"
                      title={o.isActive ? "Deactivate" : "Activate"}>
                      {o.isActive ? <ToggleRight size={22} className="text-green-600" /> : <ToggleLeft size={22} />}
                    </button>
                    <button onClick={() => deleteOffer(o.id, o.code)}
                      className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

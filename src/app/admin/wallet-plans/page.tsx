"use client";

import { useState, useEffect, useCallback } from "react";
import AdminNav from "@/components/admin/AdminNav";
import Button from "@/components/ui/Button";
import { WalletPlan } from "@/types";
import { PlusCircle, ToggleLeft, ToggleRight, Wallet, Pencil } from "lucide-react";

const emptyForm = { name: "", rechargeAmount: "", creditAmount: "", bonusAmount: "" };

export default function WalletPlansPage() {
  const [plans, setPlans] = useState<WalletPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/wallet-plans", { cache: "no-store" });
    if (res.ok) setPlans(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm(emptyForm);
    setFormError("");
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (plan: WalletPlan) => {
    setForm({
      name: plan.name,
      rechargeAmount: String(plan.rechargeAmount),
      creditAmount: String(plan.creditAmount),
      bonusAmount: String(plan.bonusAmount),
    });
    setEditingId(plan.id);
    setShowForm(true);
    setFormError("");
  };

  const handleSave = async () => {
    if (!form.name || !form.rechargeAmount || !form.creditAmount) {
      setFormError("Plan name, customer pays, and wallet credit are required.");
      return;
    }
    setSaving(true);
    setFormError("");
    const body = {
      name: form.name,
      rechargeAmount: parseFloat(form.rechargeAmount),
      creditAmount: parseFloat(form.creditAmount),
      bonusAmount: parseFloat(form.bonusAmount) || 0,
    };
    const res = editingId
      ? await fetch(`/api/admin/wallet-plans/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/admin/wallet-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
    const data = await res.json();
    if (!res.ok) { setFormError(data.error || "Failed to save plan"); }
    else { resetForm(); load(); }
    setSaving(false);
  };

  const togglePlan = async (id: string, isActive: boolean) => {
    setToggling(id);
    await fetch(`/api/admin/wallet-plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    await load();
    setToggling(null);
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="flex-1 p-4 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900">Memberships</h1>
            <p className="mt-0.5 text-sm text-zinc-500">Wallet recharge plans — customer pays once, gets wallet credit + bonus to spend later</p>
          </div>
          <Button size="sm" className="gap-2" onClick={() => { resetForm(); setShowForm(true); }}>
            <PlusCircle size={15} /> New Plan
          </Button>
        </div>

        {/* Create / edit form */}
        {showForm && (
          <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 font-bold text-zinc-900">{editingId ? "Edit Plan" : "Create New Plan"}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Plan Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Gold Membership"
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Customer Pays (₹) *</label>
                <input type="number" value={form.rechargeAmount} onChange={e => setForm({ ...form, rechargeAmount: e.target.value })}
                  placeholder="1000"
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Wallet Credit (₹) *</label>
                <input type="number" value={form.creditAmount} onChange={e => setForm({ ...form, creditAmount: e.target.value })}
                  placeholder="1000"
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none" />
                <p className="mt-1 text-xs text-zinc-400">Added to refundable balance.</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Bonus Credit (₹)</label>
                <input type="number" value={form.bonusAmount} onChange={e => setForm({ ...form, bonusAmount: e.target.value })}
                  placeholder="0"
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none" />
                <p className="mt-1 text-xs text-zinc-400">Free credit, spent first, non-refundable.</p>
              </div>
            </div>
            {formError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}
            <div className="mt-5 flex gap-3">
              <Button variant="ghost" onClick={resetForm} className="flex-1">Cancel</Button>
              <Button loading={saving} onClick={handleSave} className="flex-1">{editingId ? "Update Plan" : "Create Plan"}</Button>
            </div>
          </div>
        )}

        {/* Plans list */}
        {loading ? (
          <div className="py-20 text-center text-zinc-400">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 py-20 text-center">
            <Wallet size={32} className="mx-auto mb-4 text-zinc-300" />
            <p className="mb-2 font-semibold text-zinc-600">No membership plans yet</p>
            <p className="mb-6 text-sm text-zinc-400">Create a recharge plan, e.g. &ldquo;Pay ₹1000, get ₹1100 wallet credit&rdquo;</p>
            <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2"><PlusCircle size={15} /> Create First Plan</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map(p => (
              <div key={p.id} className={`rounded-2xl border bg-white p-5 shadow-sm transition ${p.isActive ? "border-zinc-200" : "border-zinc-100 opacity-60"}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="rounded-lg bg-zinc-900 px-3 py-1 text-sm font-bold text-white">{p.name}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="text-zinc-500">Customer Pays <span className="font-bold text-zinc-900">₹{p.rechargeAmount.toLocaleString("en-IN")}</span></span>
                      <span className="text-zinc-500">Wallet Credit <span className="font-bold text-zinc-900">₹{p.creditAmount.toLocaleString("en-IN")}</span></span>
                      {p.bonusAmount > 0 && (
                        <span className="text-zinc-500">Bonus <span className="font-bold text-green-600">+₹{p.bonusAmount.toLocaleString("en-IN")}</span></span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(p)}
                      className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                      title="Edit">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => togglePlan(p.id, p.isActive)} disabled={toggling === p.id}
                      className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 disabled:opacity-50"
                      title={p.isActive ? "Deactivate" : "Activate"}>
                      {p.isActive ? <ToggleRight size={22} className="text-green-600" /> : <ToggleLeft size={22} />}
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

"use client";

import { useEffect, useState, use, useCallback } from "react";
import AdminNav from "@/components/admin/AdminNav";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Wallet as WalletIcon, X, PlusCircle, RotateCcw, Gift, Settings2 } from "lucide-react";
import { WalletPlan, WalletTransaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface WalletData {
  customerName: string;
  customerPhone: string;
  balance: number;
  bonusBalance: number;
  transactions: WalletTransaction[];
}

const WALLET_TX_LABELS: Record<string, string> = {
  recharge: "Recharge",
  usage: "Used",
  refund: "Refund",
  bonus: "Bonus Added",
  adjustment: "Adjustment",
};

const PAYMENT_METHODS = ["cash", "upi", "card"] as const;

type ModalType = "recharge" | "refund" | "bonus" | "adjust" | null;

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${formatDate(iso.slice(0, 10))} · ${d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`;
}

export default function CustomerWalletPage({ params }: { params: Promise<{ phone: string }> }) {
  const { phone } = use(params);
  const customerPhone = decodeURIComponent(phone);

  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<WalletPlan[]>([]);
  const [modal, setModal] = useState<ModalType>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/wallet/${encodeURIComponent(customerPhone)}`, { cache: "no-store" });
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [customerPhone]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch("/api/admin/wallet-plans", { cache: "no-store" })
      .then(r => r.ok ? r.json() : [])
      .then((all: WalletPlan[]) => setPlans(all.filter(p => p.isActive)));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <AdminNav />
        <main className="flex-1 flex items-center justify-center text-zinc-400">Loading…</main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen">
        <AdminNav />
        <main className="flex-1 flex items-center justify-center text-zinc-400">Customer not found</main>
      </div>
    );
  }

  const totalAvailable = data.balance + data.bonusBalance;

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="flex-1 p-4 md:p-8 pt-20 md:pt-8">
        <Link href="/admin/customers" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900">
          <ArrowLeft size={15} /> Back to Customers
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white">
            <WalletIcon size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900">{data.customerName}</h1>
            <p className="text-sm text-zinc-500">{data.customerPhone}</p>
          </div>
        </div>

        {/* Wallet summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Balance</p>
            <p className="mt-1 text-2xl font-extrabold text-zinc-900">{formatCurrency(data.balance)}</p>
            <p className="mt-1 text-xs text-zinc-400">Refundable</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Bonus Balance</p>
            <p className="mt-1 text-2xl font-extrabold text-green-600">{formatCurrency(data.bonusBalance)}</p>
            <p className="mt-1 text-xs text-zinc-400">Spend only</p>
          </div>
          <div className="rounded-2xl border border-zinc-900 bg-zinc-900 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Available</p>
            <p className="mt-1 text-2xl font-extrabold text-white">{formatCurrency(totalAvailable)}</p>
            <p className="mt-1 text-xs text-zinc-500">Usable at checkout</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button size="sm" className="gap-1.5" onClick={() => setModal("recharge")}>
            <PlusCircle size={15} /> Recharge
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setModal("refund")}>
            <RotateCcw size={15} /> Refund
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setModal("bonus")}>
            <Gift size={15} /> Add Bonus
          </Button>
          <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => setModal("adjust")}>
            <Settings2 size={15} /> Adjust
          </Button>
        </div>

        {/* Transaction history */}
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-zinc-100 px-5 py-3">
            <h3 className="font-bold text-zinc-900">Transaction History</h3>
          </div>
          {data.transactions.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-400">No wallet transactions yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    <th className="px-5 py-2.5">Date</th>
                    <th className="px-5 py-2.5">Type</th>
                    <th className="px-5 py-2.5 text-right">Amount</th>
                    <th className="px-5 py-2.5 text-right">Balance After</th>
                    <th className="px-5 py-2.5">Paid Via</th>
                    <th className="px-5 py-2.5">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map(tx => (
                    <tr key={tx.id} className="border-b border-zinc-50 last:border-0">
                      <td className="px-5 py-3 whitespace-nowrap text-zinc-500">{formatDateTime(tx.createdAt)}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          tx.amount >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        }`}>
                          {WALLET_TX_LABELS[tx.type] || tx.type}
                        </span>
                      </td>
                      <td className={`px-5 py-3 text-right font-bold whitespace-nowrap ${tx.amount >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {tx.amount >= 0 ? "+" : ""}{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap text-zinc-700">
                        {formatCurrency(tx.balanceAfter)}
                        {tx.bonusBalanceAfter > 0 && (
                          <span className="ml-1 text-xs text-green-600">+{formatCurrency(tx.bonusBalanceAfter)} bonus</span>
                        )}
                      </td>
                      <td className="px-5 py-3 capitalize text-zinc-500">{tx.paymentMethod || "—"}</td>
                      <td className="px-5 py-3 max-w-[200px] truncate text-zinc-400">{tx.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <WalletActionModal
          type={modal}
          customerPhone={data.customerPhone}
          customerName={data.customerName}
          plans={plans}
          onClose={() => setModal(null)}
          onSuccess={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}

function WalletActionModal({
  type, customerPhone, customerName, plans, onClose, onSuccess,
}: {
  type: "recharge" | "refund" | "bonus" | "adjust";
  customerPhone: string;
  customerName: string;
  plans: WalletPlan[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [walletPlanId, setWalletPlanId] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [bonusAmount, setBonusAmount] = useState("");
  const [amount, setAmount] = useState("");
  const [delta, setDelta] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | "card">("cash");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedPlan = plans.find(p => p.id === walletPlanId);

  const titles: Record<string, string> = {
    recharge: "Recharge Wallet",
    refund: "Refund to Wallet",
    bonus: "Add Bonus Credit",
    adjust: "Adjust Wallet Balance",
  };

  const handleSubmit = async () => {
    setError("");
    let url = "";
    let body: Record<string, unknown> = { customerPhone, customerName, notes: notes.trim() || null };

    if (type === "recharge") {
      url = "/api/admin/wallet/recharge";
      if (!walletPlanId && (!creditAmount || Number(creditAmount) <= 0)) {
        setError("Select a plan or enter a wallet credit amount.");
        return;
      }
      body = {
        ...body,
        walletPlanId: walletPlanId || undefined,
        creditAmount: Number(creditAmount) || 0,
        bonusAmount: Number(bonusAmount) || 0,
        paymentMethod,
      };
    } else if (type === "refund") {
      url = "/api/admin/wallet/refund";
      if (!amount || Number(amount) <= 0) { setError("Enter a positive amount."); return; }
      body = { ...body, amount: Number(amount) };
    } else if (type === "bonus") {
      url = "/api/admin/wallet/bonus";
      if (!amount || Number(amount) <= 0) { setError("Enter a positive amount."); return; }
      body = { ...body, amount: Number(amount) };
    } else if (type === "adjust") {
      url = "/api/admin/wallet/adjust";
      if (!delta || Number(delta) === 0) { setError("Enter a non-zero adjustment amount."); return; }
      if (!notes.trim()) { setError("Notes are required for adjustments."); return; }
      body = { ...body, delta: Number(delta) };
    }

    setSaving(true);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const resData = await res.json();
    if (!res.ok) { setError(resData.error || "Something went wrong"); setSaving(false); return; }
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 shrink-0">
          <h2 className="font-bold text-zinc-900">{titles[type]}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {type === "recharge" && (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Membership Plan</label>
                <select value={walletPlanId} onChange={e => setWalletPlanId(e.target.value)}
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none">
                  <option value="">Custom amount</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — Pay ₹{p.rechargeAmount.toLocaleString("en-IN")} → ₹{p.creditAmount.toLocaleString("en-IN")}{p.bonusAmount > 0 ? ` +₹${p.bonusAmount.toLocaleString("en-IN")} bonus` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {selectedPlan ? (
                <div className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600 space-y-1">
                  <div className="flex justify-between"><span>Customer pays</span><span className="font-bold text-zinc-900">₹{selectedPlan.rechargeAmount.toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between"><span>Wallet credit</span><span className="font-bold text-zinc-900">₹{selectedPlan.creditAmount.toLocaleString("en-IN")}</span></div>
                  {selectedPlan.bonusAmount > 0 && (
                    <div className="flex justify-between"><span>Bonus credit</span><span className="font-bold text-green-600">+₹{selectedPlan.bonusAmount.toLocaleString("en-IN")}</span></div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Wallet Credit (₹)</label>
                    <input type="number" value={creditAmount} onChange={e => setCreditAmount(e.target.value)} placeholder="1000"
                      className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Bonus Credit (₹)</label>
                    <input type="number" value={bonusAmount} onChange={e => setBonusAmount(e.target.value)} placeholder="0"
                      className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none" />
                  </div>
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(m => (
                    <button key={m} onClick={() => setPaymentMethod(m)}
                      className={`rounded-xl border py-2.5 text-sm font-semibold capitalize transition ${
                        paymentMethod === m ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                      }`}>
                      {m === "upi" ? "UPI" : m === "card" ? "Card" : "Cash"}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {(type === "refund" || type === "bonus") && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Amount (₹)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
                className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none" />
              <p className="mt-1 text-xs text-zinc-400">
                {type === "refund" ? "Added to refundable balance." : "Added to non-refundable bonus balance."}
              </p>
            </div>
          )}

          {type === "adjust" && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Adjustment Amount (₹)</label>
              <input type="number" value={delta} onChange={e => setDelta(e.target.value)} placeholder="e.g. -50 or 50"
                className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none" />
              <p className="mt-1 text-xs text-zinc-400">Use a negative number to deduct from the refundable balance.</p>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Notes {type === "adjust" && <span className="text-red-500">*</span>}
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes"
              className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none" />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="border-t border-zinc-100 px-5 py-4 shrink-0 flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button loading={saving} onClick={handleSubmit} className="flex-1">Confirm</Button>
        </div>
      </div>
    </div>
  );
}

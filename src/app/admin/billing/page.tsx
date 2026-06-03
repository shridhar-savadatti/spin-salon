"use client";

import { useState, useEffect, useCallback } from "react";
import AdminNav from "@/components/admin/AdminNav";
import { Receipt, TrendingUp, CreditCard, Banknote, Smartphone } from "lucide-react";

interface Bill {
  id: string;
  billNumber: string;
  customerName: string;
  customerPhone: string;
  servicesJson: string;
  subtotal: number;
  discountAmount: number;
  discountCode: string | null;
  gstAmount: number;
  total: number;
  paymentMethod: string;
  paid: boolean;
  date: string;
  time: string;
  staffName: string | null;
  createdAt: string;
}

function formatDate(d: string) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [y, m, day] = d.split("-");
  return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`;
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2,"0")} ${ampm}`;
}

const PAYMENT_ICON: Record<string, React.ReactNode> = {
  cash: <Banknote size={13} />,
  upi: <Smartphone size={13} />,
  card: <CreditCard size={13} />,
};

const PAYMENT_COLOR: Record<string, string> = {
  cash: "bg-green-100 text-green-700",
  upi: "bg-blue-100 text-blue-700",
  card: "bg-purple-100 text-purple-700",
};

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = today.slice(0, 8) + "01";

  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(today);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/bills?from=${from}&to=${to}`, { cache: "no-store" });
    if (res.ok) setBills(await res.json());
    setLoading(false);
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const todayBills = bills.filter(b => b.date === today);
  const totalRevenue = bills.reduce((s, b) => s + b.total, 0);
  const todayRevenue = todayBills.reduce((s, b) => s + b.total, 0);
  const byMethod = bills.reduce((acc, b) => {
    acc[b.paymentMethod] = (acc[b.paymentMethod] || 0) + b.total;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-zinc-900">Billing</h1>
            <p className="text-sm text-zinc-500 mt-1">Bills generated from appointments</p>
          </div>

          {/* Date range */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-zinc-500">From</label>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-zinc-500">To</label>
              <input type="date" value={to} onChange={e => setTo(e.target.value)}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setFrom(today); setTo(today); }}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition">
                Today
              </button>
              <button onClick={() => { setFrom(firstOfMonth); setTo(today); }}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition">
                This Month
              </button>
            </div>
          </div>

          {/* Summary cards */}
          {!loading && (
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-zinc-900 text-white p-4">
                <TrendingUp size={18} className="mb-2 opacity-60" />
                <p className="text-2xl font-extrabold">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-xs opacity-60 mt-0.5">Period Revenue</p>
              </div>
              <div className="rounded-2xl bg-white border border-zinc-200 p-4">
                <Receipt size={18} className="mb-2 text-zinc-400" />
                <p className="text-2xl font-extrabold text-zinc-900">{bills.length}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Bills</p>
              </div>
              <div className="rounded-2xl bg-white border border-zinc-200 p-4">
                <TrendingUp size={18} className="mb-2 text-zinc-400" />
                <p className="text-2xl font-extrabold text-zinc-900">₹{todayRevenue.toLocaleString()}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Today</p>
              </div>
              <div className="rounded-2xl bg-white border border-zinc-200 p-4">
                <p className="text-2xl font-extrabold text-zinc-900">
                  {bills.length > 0 ? `₹${Math.round(totalRevenue / bills.length).toLocaleString()}` : "—"}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">Avg Bill</p>
              </div>
            </div>
          )}

          {/* Payment method breakdown */}
          {!loading && Object.keys(byMethod).length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {Object.entries(byMethod).map(([method, amt]) => (
                <div key={method} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${PAYMENT_COLOR[method] || "bg-zinc-100 text-zinc-700"}`}>
                  {PAYMENT_ICON[method]}
                  <span className="capitalize">{method}</span>
                  <span>· ₹{amt.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Bills list */}
          {loading ? (
            <div className="py-20 text-center text-zinc-400">Loading...</div>
          ) : bills.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center">
              <Receipt className="mx-auto mb-3 text-zinc-300" size={32} />
              <p className="text-sm text-zinc-400">No bills in this period</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
              <div className="hidden sm:grid grid-cols-12 gap-2 border-b border-zinc-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                <div className="col-span-2">Bill No.</div>
                <div className="col-span-3">Customer</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Services</div>
                <div className="col-span-1">Pay</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              <div className="divide-y divide-zinc-50">
                {bills.map(bill => {
                  const services = JSON.parse(bill.servicesJson) as { name: string; quantity?: number }[];
                  return (
                    <div key={bill.id} className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-zinc-50 transition text-sm">
                      <div className="col-span-5 sm:col-span-2">
                        <p className="font-mono text-xs font-semibold text-zinc-700">{bill.billNumber}</p>
                      </div>
                      <div className="hidden sm:block col-span-3">
                        <p className="font-semibold text-zinc-900 truncate">{bill.customerName}</p>
                        <p className="text-xs text-zinc-400">{bill.customerPhone}</p>
                      </div>
                      <div className="hidden sm:block col-span-2 text-xs text-zinc-500">
                        {formatDate(bill.date)}<br />{formatTime(bill.time)}
                      </div>
                      <div className="hidden sm:block col-span-2 text-xs text-zinc-500 truncate">
                        {services.map(s => s.name).join(", ")}
                      </div>
                      <div className="hidden sm:flex col-span-1 items-center">
                        <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${PAYMENT_COLOR[bill.paymentMethod] || "bg-zinc-100 text-zinc-600"}`}>
                          {PAYMENT_ICON[bill.paymentMethod]}
                          <span className="capitalize">{bill.paymentMethod}</span>
                        </span>
                      </div>
                      <div className="col-span-7 sm:col-span-2 text-right">
                        <p className="font-bold text-zinc-900">₹{bill.total.toLocaleString()}</p>
                        {bill.discountAmount > 0 && (
                          <p className="text-xs text-green-600">-₹{bill.discountAmount}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

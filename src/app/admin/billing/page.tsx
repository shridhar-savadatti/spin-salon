"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { SERVICES, SERVICE_CATEGORIES } from "@/lib/services-data";
import { Search, Plus, Minus, Trash2, Loader2, Receipt, TrendingUp, CreditCard, Banknote, Smartphone, User, X, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  duration: number;
  category: string;
}

interface Customer {
  name: string;
  phone: string;
}

const GST_RATE = 0.05;

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Women's Hair": "#8B5CF6",
  "Men's Hair": "#3B82F6",
  "Skincare": "#EC4899",
  "Waxing": "#F59E0B",
  "Nails": "#EF4444",
  "Bridal & Groom": "#F97316",
};

function getCategoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "#6B7280";
}

function formatCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatDate(d: string) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [y, m, day] = d.split("-");
  return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`;
}

interface Bill {
  id: string;
  billNumber: string;
  customerName: string;
  customerPhone: string;
  servicesJson: string;
  subtotal: number;
  discountAmount: number;
  gstAmount: number;
  total: number;
  paymentMethod: string;
  date: string;
  time: string;
  notes: string | null;
}

const PAYMENT_ICON: Record<string, React.ReactNode> = {
  cash: <Banknote size={13} />, upi: <Smartphone size={13} />, card: <CreditCard size={13} />,
};
const PAYMENT_COLOR: Record<string, string> = {
  cash: "bg-green-100 text-green-700", upi: "bg-blue-100 text-blue-700", card: "bg-purple-100 text-purple-700",
};

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function BillingPOS() {
  const router = useRouter();
  const [tab, setTab] = useState<"pos" | "history">("pos");
  const [noCustomerDialog, setNoCustomerDialog] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<{ name: string; phone: string; visitCount: number }[]>([]);
  const [customerDropOpen, setCustomerDropOpen] = useState(false);
  const customerRef = useRef<HTMLDivElement>(null);
  const [discountType, setDiscountType] = useState<"pct" | "flat">("pct");
  const [discountValue, setDiscountValue] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // History state
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = today.slice(0, 8) + "01";
  const [bills, setBills] = useState<Bill[]>([]);
  const [billsLoading, setBillsLoading] = useState(false);
  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(today);

  const loadBills = useCallback(async () => {
    setBillsLoading(true);
    const res = await fetch(`/api/admin/bills?from=${from}&to=${to}`, { cache: "no-store" });
    if (res.ok) setBills(await res.json());
    setBillsLoading(false);
  }, [from, to]);

  useEffect(() => { if (tab === "history") loadBills(); }, [tab, loadBills]);

  // Customer search
  useEffect(() => {
    if (customerQuery.length < 2) { setCustomerResults([]); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/admin/customers?q=${encodeURIComponent(customerQuery)}`).catch(() => null);
      if (res?.ok) {
        const data = await res.json();
        setCustomerResults((data.customers || []).slice(0, 6));
      }
    }, 250);
    return () => clearTimeout(t);
  }, [customerQuery]);

  // Close customer dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (customerRef.current && !customerRef.current.contains(e.target as Node)) setCustomerDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = SERVICES.filter(s =>
    (activeCategory === null || s.category === activeCategory) &&
    (!search || s.name.toLowerCase().includes(search.toLowerCase()))
  );

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmt = (() => {
    const v = parseFloat(discountValue) || 0;
    if (!v) return 0;
    if (discountType === "pct") return Math.round(subtotal * v / 100);
    return Math.min(v, subtotal);
  })();
  const afterDiscount = subtotal - discountAmt;
  const gstAmt = Math.round(afterDiscount * GST_RATE);
  const total = afterDiscount + gstAmt;

  const addItem = (svc: typeof SERVICES[0]) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === svc.id);
      if (ex) return prev.map(i => i.id === svc.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: svc.id, name: svc.name, price: svc.price, quantity: 1, duration: svc.duration, category: svc.category }];
    });
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.id !== id));
    else setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const selectCustomer = (c: { name: string; phone: string } | null) => {
    setCustomer(c);
    setCustomerQuery("");
    setCustomerResults([]);
    setCustomerDropOpen(false);
  };

  const handlePhoneChange = (val: string) => {
    // kept for compat — not used in new UI
    void val;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!customer) { setNoCustomerDialog(true); return; }
    setProcessing(true);
    const today = new Date().toISOString().split("T")[0];
    const time = new Date().toTimeString().slice(0, 5);
    try {
      const res = await fetch("/api/admin/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customer?.name?.trim() || "Walk-in Customer",
          customerPhone: customer?.phone?.trim() || null,
          servicesJson: JSON.stringify(cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity }))),
          subtotal,
          discountAmount: discountAmt,
          gstAmount: gstAmt,
          total,
          paymentMethod,
          notes: notes.trim() || null,
          date: today,
          time,
        }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (res.ok) {
        router.push(`/admin/billing/${data.id}`);
      } else {
        alert(data.error || `Error ${res.status} — please try again`);
      }
    } catch (err) {
      alert("Network error — please try again");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  // History view
  if (tab === "history") {
    const totalRevenue = bills.reduce((s, b) => s + b.total, 0);
    const todayRevenue = bills.filter(b => b.date === today).reduce((s, b) => s + b.total, 0);
    return (
      <div className="flex min-h-screen">
        <AdminNav />
        <div className="flex flex-col flex-1 overflow-hidden h-screen">
          {/* Tabs */}
          <div className="flex shrink-0 border-b border-zinc-200 bg-white px-4">
            {(["pos", "history"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  tab === t ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-700"
                }`}>
                {t === "pos" ? "New Bill" : "Invoices"}
              </button>
            ))}
          </div>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Date filter */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
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
              <button onClick={() => { setFrom(today); setTo(today); }}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50">Today</button>
              <button onClick={() => { setFrom(firstOfMonth); setTo(today); }}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50">This Month</button>
            </div>

            {/* Summary */}
            {!billsLoading && (
              <div className="mb-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-zinc-900 text-white p-4">
                  <TrendingUp size={16} className="mb-1 opacity-60" />
                  <p className="text-xl font-extrabold">₹{totalRevenue.toLocaleString()}</p>
                  <p className="text-xs opacity-60">Period Revenue</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <Receipt size={16} className="mb-1 text-zinc-400" />
                  <p className="text-xl font-extrabold text-zinc-900">{bills.length}</p>
                  <p className="text-xs text-zinc-500">Bills</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <TrendingUp size={16} className="mb-1 text-zinc-400" />
                  <p className="text-xl font-extrabold text-zinc-900">₹{todayRevenue.toLocaleString()}</p>
                  <p className="text-xs text-zinc-500">Today</p>
                </div>
              </div>
            )}

            {/* Bills list */}
            {billsLoading ? (
              <div className="py-20 text-center text-zinc-400">Loading...</div>
            ) : bills.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center">
                <Receipt className="mx-auto mb-3 text-zinc-300" size={32} />
                <p className="text-sm text-zinc-400">No bills in this period</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                  <div className="divide-y divide-zinc-100">
                  {bills.map(bill => (
                    <Link key={bill.id} href={`/admin/billing/${bill.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50 transition-colors">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white shrink-0">
                        {bill.customerName[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-800 truncate">{bill.customerName}</p>
                        <p className="text-xs text-zinc-500">{bill.billNumber} · {formatDate(bill.date)} {formatTime(bill.time)}</p>
                      </div>
                      <span className={`shrink-0 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${PAYMENT_COLOR[bill.paymentMethod] || "bg-zinc-100 text-zinc-600"}`}>
                        {PAYMENT_ICON[bill.paymentMethod]}
                        <span className="capitalize">{bill.paymentMethod}</span>
                      </span>
                      <p className="text-sm font-bold text-zinc-900 tabular-nums shrink-0">₹{bill.total.toLocaleString()}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <div className="flex flex-col flex-1 overflow-hidden h-screen">

        {/* ── Tabs ── */}
        <div className="flex shrink-0 border-b border-zinc-200 bg-white px-4">
          {(["pos", "history"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === t
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-400 hover:text-zinc-700"
              }`}>
              {t === "pos" ? "New Bill" : "Invoices"}
            </button>
          ))}
        </div>

      <main className="flex flex-1 overflow-hidden">

        {/* ── Left: Service grid ── */}
        <div className="flex flex-col flex-1 border-r border-zinc-200 overflow-hidden">
          {/* Search + categories */}
          <div className="border-b border-zinc-100 bg-white p-4 space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-800 flex-1">Services</h2>
              <span className="text-xs text-zinc-400">{filtered.length} available</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search services..."
                className="w-full rounded-xl border border-zinc-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-zinc-900 transition-colors" />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
              {[null, ...SERVICE_CATEGORIES].map(cat => (
                <button key={String(cat)} onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    activeCategory === cat ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}>
                  {cat ?? "All"}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map(svc => {
                const inCart = cart.find(i => i.id === svc.id);
                const qty = inCart?.quantity ?? 0;
                return (
                  <button key={svc.id} onClick={() => addItem(svc)}
                    className={`relative flex flex-col items-start rounded-xl border p-3 text-left transition-all min-h-[80px] hover:shadow-md active:scale-95 ${
                      qty > 0 ? "border-zinc-900 bg-zinc-50 shadow-sm" : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}>
                    {qty > 0 && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">{qty}</span>
                    )}
                    <div className="mb-2 rounded-lg bg-zinc-100 p-1.5">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getCategoryColor(svc.category) }} />
                    </div>
                    <p className="text-xs font-semibold text-zinc-800 leading-tight line-clamp-2">{svc.name}</p>
                    <p className="mt-1.5 text-sm font-bold text-zinc-900">{formatCurrency(svc.price)}</p>
                    {svc.duration > 0 && <p className="text-[10px] text-zinc-400">{svc.duration} min</p>}
                    {qty === 0 && <Plus className="absolute bottom-2.5 right-2.5 h-3.5 w-3.5 text-zinc-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right: Cart ── */}
        <div id="cart-section" className="flex flex-col w-80 xl:w-96 bg-zinc-50 overflow-hidden">

          {/* Customer */}
          <div className="border-b border-zinc-200 bg-white p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Customer</p>
            {customer ? (
              <div className="flex items-center gap-3 rounded-xl border border-zinc-900 bg-zinc-50 px-3 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white shrink-0">
                  {customer.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-800 truncate">{customer.name}</p>
                  {customer.phone && <p className="text-xs text-zinc-400">{customer.phone}</p>}
                </div>
                <button onClick={() => selectCustomer(null)} className="rounded p-1 hover:bg-zinc-200 transition-colors">
                  <X className="h-3.5 w-3.5 text-zinc-500" />
                </button>
              </div>
            ) : (
              <div ref={customerRef} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input value={customerQuery}
                    onChange={e => { setCustomerQuery(e.target.value); setCustomerDropOpen(true); }}
                    onFocus={() => setCustomerDropOpen(true)}
                    placeholder="Search by name or phone..."
                    className="w-full rounded-xl border border-zinc-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-zinc-900 transition-colors" />
                </div>
                {customerDropOpen && (customerQuery.length >= 2 || customerResults.length > 0) && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
                    {customerResults.map(c => (
                      <button key={c.phone} onClick={() => selectCustomer({ name: c.name, phone: c.phone })}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-zinc-50 transition-colors">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 shrink-0">
                          {c.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-800">{c.name}</p>
                          <p className="text-xs text-zinc-400">{c.phone} · {c.visitCount} visits</p>
                        </div>
                      </button>
                    ))}
                    {customerQuery.length >= 2 && customerResults.length === 0 && (
                      <p className="px-3 py-2 text-xs text-zinc-400">No customers found</p>
                    )}
                    <button onClick={() => selectCustomer({ name: "Walk-in Customer", phone: "" })}
                      className="flex w-full items-center gap-3 border-t border-zinc-100 px-3 py-2.5 text-xs text-zinc-500 hover:bg-zinc-50 transition-colors">
                      <User className="h-3.5 w-3.5" /> Continue as walk-in
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              Cart · {cart.length} {cart.length === 1 ? "item" : "items"}
            </p>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                <Receipt className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm font-medium">Cart is empty</p>
                <p className="text-xs mt-0.5">Select services from the left</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-start gap-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-800 leading-tight">{item.name}</p>
                    <p className="text-xs text-zinc-400">{formatCurrency(item.price)} each</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 hover:bg-zinc-700 transition-colors">
                      <Plus className="h-3 w-3 text-white" />
                    </button>
                    <button onClick={() => updateQty(item.id, 0)}
                      className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-red-400 hover:bg-red-50 transition-colors">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-zinc-900 tabular-nums shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Summary + checkout */}
          <div className="border-t border-zinc-200 bg-white p-4 space-y-3">

            {/* Discount — collapsible */}
            <div className="rounded-xl border border-zinc-100 overflow-hidden">
              <button onClick={() => setShowDiscount(s => !s)}
                className="flex w-full items-center justify-between px-3 py-2.5 bg-zinc-50 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 transition-colors">
                <span className="flex items-center gap-2">
                  Discount
                  {discountAmt > 0 && <span className="text-green-600 font-medium normal-case tracking-normal">−{formatCurrency(discountAmt)}</span>}
                </span>
                <span className="text-zinc-400 text-base leading-none">{showDiscount ? "−" : "+"}</span>
              </button>
              {showDiscount && (
                <div className="p-3 space-y-2 bg-zinc-50">
                  <div className="flex gap-1.5">
                    {(["pct", "flat"] as const).map(t => (
                      <button key={t} onClick={() => setDiscountType(t)}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                          discountType === t ? "bg-zinc-900 text-white" : "bg-zinc-200 text-zinc-600"
                        }`}>
                        {t === "pct" ? "% Off" : "₹ Flat"}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)}
                      placeholder={discountType === "pct" ? "e.g. 10" : "e.g. 200"}
                      className="flex-1 rounded-xl border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:border-zinc-900 bg-white" />
                    {discountValue && (
                      <button onClick={() => setDiscountValue("")}
                        className="rounded-xl bg-zinc-200 px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-300">
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notes — collapsible */}
            <div className="rounded-xl border border-zinc-100 overflow-hidden">
              <button onClick={() => setShowNotes(s => !s)}
                className="flex w-full items-center justify-between px-3 py-2.5 bg-zinc-50 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 transition-colors">
                <span className="flex items-center gap-2">
                  Notes
                  {notes && <span className="font-normal text-zinc-400 normal-case tracking-normal truncate max-w-[120px]">{notes}</span>}
                </span>
                <span className="text-zinc-400 text-base leading-none">{showNotes ? "−" : "+"}</span>
              </button>
              {showNotes && (
                <div className="p-3 bg-zinc-50">
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                    placeholder="e.g. preferred stylist, special requests..."
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 resize-none transition-colors" />
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-zinc-500"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              {discountAmt > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>−{formatCurrency(discountAmt)}</span></div>
              )}
              <div className="flex justify-between text-zinc-500"><span>GST (5%)</span><span>{formatCurrency(gstAmt)}</span></div>
              <div className="flex justify-between border-t border-zinc-200 pt-2 font-bold text-zinc-900 text-base">
                <span>Total</span><span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Payment</p>
              <div className="grid grid-cols-3 gap-1.5">
                {PAYMENT_METHODS.map(m => (
                  <button key={m.value} onClick={() => setPaymentMethod(m.value)}
                    className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                      paymentMethod === m.value ? "bg-zinc-900 text-white shadow-sm" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Charge button */}
            <button onClick={handleCheckout} disabled={cart.length === 0 || processing}
              className="w-full rounded-full bg-zinc-900 py-3.5 text-sm font-bold text-white hover:bg-zinc-700 disabled:opacity-40 transition flex items-center justify-center gap-2">
              {processing ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                `Charge ${formatCurrency(total)}`
              )}
            </button>

            {cart.length > 0 && (
              <button onClick={() => setCart([])}
                className="w-full text-xs text-zinc-400 hover:text-red-500 transition-colors">
                Clear cart
              </button>
            )}
          </div>
        </div>
      </main>

      {/* No-customer dialog */}
      {noCustomerDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200">
            <h3 className="text-base font-bold text-zinc-900 mb-1">No customer selected</h3>
            <p className="text-sm text-zinc-500 mb-5">Add a customer to this invoice, or continue as a walk-in.</p>
            <div className="space-y-2">
              <button
                onClick={() => { setNoCustomerDialog(false); }}
                className="flex w-full items-center gap-3 rounded-xl border-2 border-zinc-900 bg-white px-4 py-3 text-left hover:bg-zinc-50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 shrink-0">
                  <UserPlus className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">Add a customer</p>
                  <p className="text-xs text-zinc-500">Search by name or phone number</p>
                </div>
              </button>
              <button
                onClick={() => { selectCustomer({ name: "Walk-in Customer", phone: "" }); setNoCustomerDialog(false); }}
                className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left hover:bg-zinc-50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 shrink-0">
                  <User className="h-4 w-4 text-zinc-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-700">Continue as walk-in</p>
                  <p className="text-xs text-zinc-500">No customer record will be saved</p>
                </div>
              </button>
              <button onClick={() => setNoCustomerDialog(false)}
                className="w-full text-xs text-zinc-400 hover:text-zinc-600 pt-1 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

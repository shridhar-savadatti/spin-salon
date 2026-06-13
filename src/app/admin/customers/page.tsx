"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Customer {
  name: string;
  phone: string;
  visitCount: number;
  lastVisit: string | null;
  source: "appointment" | "imported";
  walletBalance: number;
}

function formatLastVisit(date: string | null): string {
  if (!date) return "—";
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [y, m, d] = date.split("-");
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers?q=${encodeURIComponent(q)}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val: string) => {
    setSearch(val);
    load(val);
  };

  const waLink = (phone: string, name: string) => {
    const digits = phone.replace(/\D/g, "");
    const full = digits.length === 10 ? `91${digits}` : digits;
    return `https://wa.me/${full}?text=${encodeURIComponent(`Hi ${name.split(" ")[0]}! 👋`)}`;
  };

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <div className="flex-1 p-4 md:p-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-zinc-900">
            Customers{" "}
            {!loading && <span className="text-base font-normal text-zinc-400">({total.toLocaleString()} total)</span>}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">All customers from bookings and imported records.</p>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-2xl font-bold text-zinc-900">{total.toLocaleString()}</p>
              <p className="text-xs text-zinc-500 mt-0.5">Total customers</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-2xl font-bold text-zinc-900">
                {customers.filter(c => c.source === "appointment").length.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">Have bookings</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-2xl font-bold text-zinc-900">
                {customers.filter(c => c.source === "imported").length.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">Imported only</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 max-w-md">
          <Search size={16} className="shrink-0 text-zinc-400" />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="flex-1 text-sm outline-none placeholder:text-zinc-400"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="py-20 text-center text-zinc-400">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center text-zinc-400">
            No customers found.
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-12 gap-3 border-b border-zinc-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              <div className="col-span-3">Name</div>
              <div className="col-span-3">Phone</div>
              <div className="col-span-1 text-center">Visits</div>
              <div className="col-span-2">Last Visit</div>
              <div className="col-span-2">Wallet</div>
              <div className="col-span-1" />
            </div>

            {/* Rows */}
            <div className="divide-y divide-zinc-50">
              {customers.map((c, i) => (
                <div key={`${c.phone}-${i}`}
                  onClick={() => c.phone && router.push(`/admin/customers/${encodeURIComponent(c.phone)}`)}
                  className={`grid grid-cols-12 gap-3 items-center px-4 py-3 hover:bg-zinc-50 transition ${c.phone ? "cursor-pointer" : ""}`}>
                  <div className="col-span-7 sm:col-span-3">
                    <p className="font-semibold text-zinc-900 text-sm">{c.name}</p>
                    <p className="text-xs text-zinc-400 sm:hidden">{c.phone}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {c.source === "imported" && (
                        <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">imported</span>
                      )}
                      {c.walletBalance > 0 && (
                        <span className="sm:hidden inline-block rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                          {formatCurrency(c.walletBalance)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:block col-span-3 text-sm text-zinc-600">{c.phone}</div>
                  <div className="hidden sm:block col-span-1 text-center">
                    {c.visitCount > 0 ? (
                      <span className="inline-block rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-bold text-white">
                        {c.visitCount}
                      </span>
                    ) : (
                      <span className="text-zinc-300 text-sm">—</span>
                    )}
                  </div>
                  <div className="hidden sm:block col-span-2 text-xs text-zinc-500">{formatLastVisit(c.lastVisit)}</div>
                  <div className="hidden sm:block col-span-2 text-sm">
                    {c.walletBalance > 0 ? (
                      <span className="font-semibold text-green-700">{formatCurrency(c.walletBalance)}</span>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </div>
                  <div className="col-span-5 sm:col-span-1 flex justify-end">
                    <a
                      href={waLink(c.phone, c.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 hover:bg-green-100 transition"
                      title="WhatsApp"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-green-600">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import AdminNav from "@/components/admin/AdminNav";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { Search, RefreshCw, MessageCircle } from "lucide-react";

interface Appointment {
  id: string; customerName: string; customerPhone: string;
  serviceId: string; serviceName: string; servicePrice: number;
  date: string; time: string; notes: string | null; status: string;
  createdAt: string; staffId: string | null; staffName: string | null;
  servicesJson?: string | null; totalDuration?: number | null;
  discountCode?: string | null; discountAmount?: number | null; finalPrice?: number | null;
}
interface Staff { id: string; name: string; role: string; }

const STATUSES = ["all", "pending", "confirmed", "completed", "cancelled"];

function buildWaLink(appointment: Appointment, status: string): string {
  const digits = appointment.customerPhone.replace(/\D/g, "");
  const phone = digits.length === 10 ? `91${digits}` : digits;
  const name = appointment.customerName.split(" ")[0];
  const serviceDisplay = appointment.servicesJson ? (JSON.parse(appointment.servicesJson) as {name:string}[]).map(s=>s.name).join(', ') : appointment.serviceName;
  const details = `\n\n📅 ${appointment.date}\n⏰ ${appointment.time}\n💇 ${serviceDisplay}${appointment.staffName ? `\n👤 Stylist: ${appointment.staffName}` : ''}`;

  let msg = "";
  if (status === "confirmed") {
    msg = `Hi ${name}! ✅ Your appointment at *Spin Unisex Salon, Kudlu Bengaluru* is confirmed.${details}\n\nSee you soon! 😊`;
  } else if (status === "cancelled") {
    msg = `Hi ${name}! ❌ Your appointment at *Spin Unisex Salon, Kudlu Bengaluru* has been cancelled.${details}\n\nWe're sorry. Please call us to reschedule:\n📞 +91 91643 63131`;
  } else if (status === "completed") {
    msg = `Hi ${name}! 🙏 Thank you for visiting *Spin Unisex Salon, Kudlu Bengaluru*!\n\nWe hope you loved your ${appointment.serviceName}. See you again! Book at spinkudlu.com`;
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  // Track pending WhatsApp notifications: { appointmentId -> { status, waLink } }
  const [pendingWa, setPendingWa] = useState<Record<string, { status: string; waLink: string }>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const base = window.location.origin;
      const [r1, r2] = await Promise.all([
        fetch(`${base}/api/appointments`, { cache: "no-store" }),
        fetch(`${base}/api/staff`, { cache: "no-store" }),
      ]);
      if (r1.ok) {
        const raw = await r1.json();
        setAppointments(raw.map((a: Record<string, unknown>) => ({
          id: a.id, customerName: a.customer_name, customerPhone: a.customer_phone,
          serviceId: a.service_id, serviceName: a.service_name, servicePrice: a.service_price,
          date: a.date, time: a.time, notes: a.notes, status: a.status,
          createdAt: a.created_at, staffId: a.staff_id, staffName: a.staff_name,
          servicesJson: a.services_json, totalDuration: a.total_duration,
          discountCode: a.discount_code, discountAmount: a.discount_amount, finalPrice: a.final_price,
        })));
      }
      if (r2.ok) setStaff(await r2.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string, appointment: Appointment) => {
    setUpdating(id);
    await fetch(`${window.location.origin}/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    load();

    // Store pending WhatsApp notification — user taps the button directly
    if (status === "confirmed" || status === "cancelled" || status === "completed") {
      setPendingWa(prev => ({
        ...prev,
        [id]: { status, waLink: buildWaLink(appointment, status) },
      }));
    }
  };

  const filtered = appointments.filter(a => {
    const matchStatus = filter === "all" || a.status === filter;
    const matchStaff = staffFilter === "all" || a.staffId === staffFilter;
    const matchSearch = !search ||
      a.customerName.toLowerCase().includes(search.toLowerCase()) ||
      a.customerPhone.includes(search) ||
      a.serviceName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchStaff && matchSearch;
  });

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === "all" ? appointments.length : appointments.filter(a => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <div className="flex-1 p-4 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-zinc-900">
            Appointments {!loading && <span className="text-base font-normal text-zinc-400">({appointments.length})</span>}
          </h1>
          <Button variant="ghost" size="sm" onClick={load} className="gap-2">
            <RefreshCw size={15} /> Refresh
          </Button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-zinc-400">Loading appointments...</div>
        ) : (
          <>
            <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {STATUSES.map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`rounded-xl border p-3 text-left transition ${filter === s ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white hover:border-zinc-400"}`}>
                  <p className="text-xl font-bold">{counts[s]}</p>
                  <p className="mt-0.5 text-xs capitalize opacity-70">{s}</p>
                </button>
              ))}
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5">
                <Search size={16} className="shrink-0 text-zinc-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, phone or service..."
                  className="flex-1 text-sm outline-none placeholder:text-zinc-400" />
              </div>
              <select value={staffFilter} onChange={e => setStaffFilter(e.target.value)}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 focus:outline-none">
                <option value="all">All Stylists</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center text-zinc-400">
                No appointments match this filter.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-zinc-100 bg-zinc-50">
                      <tr>
                        {["Client", "Service", "Stylist", "Date & Time", "Price", "Status", "Actions"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {filtered.map(a => (
                        <tr key={a.id} className="hover:bg-zinc-50">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-zinc-900">{a.customerName}</p>
                            <p className="text-xs text-zinc-400">{a.customerPhone}</p>
                            {a.notes && <p className="mt-0.5 text-xs italic text-zinc-400">"{a.notes}"</p>}
                          </td>
                          <td className="px-4 py-3">
                            {a.servicesJson ? (
                              <div>
                                {(JSON.parse(a.servicesJson) as {name:string;price:number}[]).map((s,i) => (
                                  <p key={i} className="text-xs text-zinc-700">{s.name} — ₹{s.price}</p>
                                ))}
                                {a.discountCode && <p className="text-xs text-green-600 mt-0.5">🏷 {a.discountCode}</p>}
                              </div>
                            ) : (
                              <p className="text-zinc-700">{a.serviceName}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-zinc-700">{a.staffName || "—"}</td>
                          <td className="px-4 py-3">
                            <p className="text-zinc-900">{formatDate(a.date)}</p>
                            <p className="text-xs text-zinc-400">{formatTime(a.time)}</p>
                          </td>
                          <td className="px-4 py-3 font-medium text-zinc-900">{formatCurrency(a.servicePrice)}</td>
                          <td className="px-4 py-3"><Badge status={a.status} /></td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {a.status === "pending" && (
                                <button onClick={() => updateStatus(a.id, "confirmed", a)} disabled={updating === a.id}
                                  className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 disabled:opacity-50">
                                  Confirm
                                </button>
                              )}
                              {a.status === "confirmed" && (
                                <button onClick={() => updateStatus(a.id, "completed", a)} disabled={updating === a.id}
                                  className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600 hover:bg-green-100 disabled:opacity-50">
                                  Complete
                                </button>
                              )}
                              {a.status !== "cancelled" && a.status !== "completed" && (
                                <button onClick={() => updateStatus(a.id, "cancelled", a)} disabled={updating === a.id}
                                  className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50">
                                  Cancel
                                </button>
                              )}
                              {/* WhatsApp notify button — appears after action, direct tap = no popup block */}
                              {pendingWa[a.id] && (
                                <a
                                  href={pendingWa[a.id].waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setPendingWa(prev => { const n = {...prev}; delete n[a.id]; return n; })}
                                  className="flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700"
                                >
                                  <MessageCircle size={11} />
                                  Notify {pendingWa[a.id].status === "confirmed" ? "✅" : pendingWa[a.id].status === "cancelled" ? "❌" : "🙏"}
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

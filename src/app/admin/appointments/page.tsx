"use client";

import { useState, useEffect, useCallback } from "react";
import AdminNav from "@/components/admin/AdminNav";
import Badge from "@/components/ui/Badge";
import { formatTime, formatCurrency } from "@/lib/utils";
import { Search, MessageCircle, Plus } from "lucide-react";
import { SERVICES, SERVICE_CATEGORIES } from "@/lib/services-data";
import { SelectedService } from "@/types";

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

function formatDateLabel(dateStr: string): string {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  if (dateStr === today) return "📅 Today";
  if (dateStr === tomorrow) return "📅 Tomorrow";
  const [year, month, day] = dateStr.split("-");
  return `📅 ${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

function buildWaLink(appointment: Appointment, status: string): string {
  const digits = appointment.customerPhone.replace(/\D/g, "");
  const phone = digits.length === 10 ? `91${digits}` : digits;
  const name = appointment.customerName.split(" ")[0];
  const serviceDisplay = appointment.servicesJson
    ? (JSON.parse(appointment.servicesJson) as { name: string }[]).map(s => s.name).join(", ")
    : appointment.serviceName;
  const details = `\n\n📅 ${appointment.date}\n⏰ ${appointment.time}\n💇 ${serviceDisplay}${appointment.staffName ? `\n👤 Stylist: ${appointment.staffName}` : ""}`;

  let msg = "";
  if (status === "confirmed") {
    msg = `Hi ${name}! ✅ Your appointment at *Spin Unisex Salon, Kudlu Bengaluru* is confirmed.${details}\n\nSee you soon! 😊`;
  } else if (status === "cancelled") {
    msg = `Hi ${name}! ❌ Your appointment at *Spin Unisex Salon, Kudlu Bengaluru* has been cancelled.${details}\n\nWe're sorry. Please call us to reschedule:\n📞 +91 91643 63131`;
  } else if (status === "completed") {
    msg = `Hi ${name}! 🙏 Thank you for visiting *Spin Unisex Salon, Kudlu Bengaluru*!\n\nWe hope you loved your ${serviceDisplay}. See you again! Book at spinkudlu.com`;
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

// Persistent alarm — plays repeating MP3 alarm until dismissed
let alarmAudio: HTMLAudioElement | null = null;

function startPersistentAlarm() {
  try {
    if (alarmAudio) { alarmAudio.pause(); alarmAudio = null; }
    const audio = new Audio("/alarm.mp3");
    audio.loop = true;
    audio.volume = 1.0;
    alarmAudio = audio;
    audio.play().catch(() => {});
  } catch { /* ignore */ }
}

function stopPersistentAlarm() {
  if (alarmAudio) {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
    alarmAudio = null;
  }
}

function playAlertSound() {
  startPersistentAlarm();
}

function currentTimeHHMM(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function WalkInModal({ staff, onClose, onSuccess }: { staff: Staff[]; onClose: () => void; onSuccess: () => void }) {
  const today = new Date().toISOString().split("T")[0];
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(today);
  const [time, setTime] = useState(currentTimeHHMM);
  const [staffId, setStaffId] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [pickService, setPickService] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [knownCustomer, setKnownCustomer] = useState<{ name: string; lastVisit: string | null; source: string } | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  const handlePhoneChange = async (val: string) => {
    setPhone(val);
    setKnownCustomer(null);
    const digits = val.replace(/\D/g, "");
    if (digits.length !== 10) return;
    setLookingUp(true);
    try {
      const res = await fetch(`/api/admin/customer-lookup?phone=${digits}`);
      const data = await res.json();
      if (data.customer) {
        setKnownCustomer(data.customer);
        if (!name.trim()) setName(data.customer.name);
      }
    } finally {
      setLookingUp(false);
    }
  };

  const addService = () => {
    const svc = SERVICES.find(s => s.id === pickService);
    if (!svc) return;
    const existing = selectedServices.find(s => s.id === svc.id);
    if (existing) {
      setSelectedServices(prev => prev.map(s => s.id === svc.id ? { ...s, quantity: s.quantity + 1 } : s));
    } else {
      setSelectedServices(prev => [...prev, { id: svc.id, name: svc.name, price: svc.price, duration: svc.duration, category: svc.category, quantity: 1 }]);
    }
    setPickService("");
  };

  const removeService = (id: string) => setSelectedServices(prev => prev.filter(s => s.id !== id));

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration * s.quantity, 0);

  const submit = async () => {
    if (!name.trim() || !phone.trim() || !date || !time || selectedServices.length === 0) {
      setError("Fill all required fields and add at least one service.");
      return;
    }
    if (phone.replace(/\D/g, "").length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: phone.trim(),
          date, time,
          staffId: staffId || undefined,
          notes: notes.trim() || undefined,
          selectedServices,
          walkIn: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create booking.");
      } else {
        onSuccess();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 shrink-0">
          <h2 className="text-lg font-bold text-zinc-900">Add Walk-in</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 text-xl leading-none">✕</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-100">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Customer name"
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Phone *</label>
              <input value={phone} onChange={e => handlePhoneChange(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit number" type="tel" maxLength={10}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none" />
            </div>
          </div>

          {/* Existing customer banner */}
          {lookingUp && (
            <p className="text-xs text-zinc-400 -mt-2">Looking up customer...</p>
          )}
          {knownCustomer && (
            <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-2.5 flex items-center gap-2 -mt-2">
              <span className="text-blue-500 text-base">👤</span>
              <div>
                <p className="text-sm font-semibold text-blue-800">Returning customer</p>
                <p className="text-xs text-blue-600">
                  {knownCustomer.name}
                  {knownCustomer.lastVisit ? ` · Last visit: ${knownCustomer.lastVisit}` : ""}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Time *</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Stylist</label>
            <select value={staffId} onChange={e => setStaffId(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none bg-white">
              <option value="">Auto-assign</option>
              {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Services *</label>
            <div className="flex gap-2">
              <select value={pickService} onChange={e => setPickService(e.target.value)}
                className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none bg-white">
                <option value="">Select a service...</option>
                {SERVICE_CATEGORIES.map(cat => (
                  <optgroup key={cat} label={cat}>
                    {SERVICES.filter(s => s.category === cat).map(s => (
                      <option key={s.id} value={s.id}>{s.name} — ₹{s.price}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <button onClick={addService} disabled={!pickService}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-zinc-700">
                Add
              </button>
            </div>

            {selectedServices.length > 0 && (
              <div className="mt-2 rounded-xl border border-zinc-100 overflow-hidden">
                {selectedServices.map(s => (
                  <div key={s.id} className="flex items-center justify-between px-3 py-2 text-sm border-b border-zinc-50 last:border-0">
                    <span className="text-zinc-700">{s.name}{s.quantity > 1 ? ` ×${s.quantity}` : ""}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400">₹{s.price * s.quantity}</span>
                      <button onClick={() => removeService(s.id)} className="text-red-400 hover:text-red-600 font-bold leading-none">✕</button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between px-3 py-2 text-sm font-bold text-zinc-900 bg-zinc-50">
                  <span>Total</span>
                  <span>₹{totalPrice} · ~{totalDuration} min</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes..."
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 px-6 py-4 shrink-0">
          <button onClick={submit} disabled={saving}
            className="w-full rounded-full bg-zinc-900 py-3 text-sm font-bold text-white hover:bg-zinc-700 disabled:opacity-50 transition">
            {saving ? "Creating..." : "Confirm Walk-in ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [staffFilter, setStaffFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [pendingWa, setPendingWa] = useState<Record<string, { status: string; waLink: string }>>({});
  const [newCount, setNewCount] = useState(0);
  const [lastKnownIds, setLastKnownIds] = useState<Set<string>>(new Set());
  const [showWalkIn, setShowWalkIn] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const base = window.location.origin;
      const [r1, r2] = await Promise.all([
        fetch(`${base}/api/appointments`, { cache: "no-store" }),
        fetch(`${base}/api/staff`, { cache: "no-store" }),
      ]);
      if (r1.ok) {
        const raw = await r1.json();
        const sorted = raw.map((a: Record<string, unknown>) => ({
          id: a.id, customerName: a.customer_name, customerPhone: a.customer_phone,
          serviceId: a.service_id, serviceName: a.service_name, servicePrice: a.service_price,
          date: a.date, time: a.time, notes: a.notes, status: a.status,
          createdAt: a.created_at, staffId: a.staff_id, staffName: a.staff_name,
          servicesJson: a.services_json, totalDuration: a.total_duration,
          discountCode: a.discount_code, discountAmount: a.discount_amount, finalPrice: a.final_price,
        })).sort((a: Appointment, b: Appointment) => {
          if (a.date !== b.date) return a.date < b.date ? -1 : 1;
          return a.time < b.time ? -1 : 1;
        });

        // Detect new bookings (new IDs not seen before)
        if (lastKnownIds.size > 0) {
          const incoming = sorted as Appointment[];
          const newOnes = incoming.filter(a => a.status === "pending" && !lastKnownIds.has(a.id));
          if (newOnes.length > 0) {
            setNewCount(c => c + newOnes.length);
            // Play alert sound using Web Audio API — works on all browsers
            playAlertSound();
          }
        }
        setLastKnownIds(new Set((sorted as Appointment[]).map(a => a.id)));
        setAppointments(sorted);
      }
      if (r2.ok) setStaff(await r2.json());
    } finally {
      if (!silent) setLoading(false);
    }
  }, [lastKnownIds]);

  // Initial load + clear badge when page opens
  useEffect(() => {
    load();
    // Clear app icon badge count when admin views appointments
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.active?.postMessage("clear-badge");
      }).catch(() => {});
    }
    if ("clearAppBadge" in navigator) {
      (navigator as unknown as { clearAppBadge: () => Promise<void> }).clearAppBadge().catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-poll every 30 seconds silently
  useEffect(() => {
    const interval = setInterval(() => load(true), 30000);
    return () => clearInterval(interval);
  }, [load]);

  const updateStatus = async (id: string, status: string, appointment: Appointment) => {
    setUpdating(id);
    await fetch(`${window.location.origin}/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    load();
    if (status === "confirmed" || status === "cancelled" || status === "completed") {
      setPendingWa(prev => ({ ...prev, [id]: { status, waLink: buildWaLink(appointment, status) } }));
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

  // Group filtered appointments by date
  const today = new Date().toISOString().split("T")[0];
  const grouped = filtered.reduce((acc, a) => {
    if (!acc[a.date]) acc[a.date] = [];
    acc[a.date].push(a);
    return acc;
  }, {} as Record<string, Appointment[]>);
  const sortedDates = Object.keys(grouped).sort();
  const upcomingDates = sortedDates.filter(d => d >= today);
  const pastDates = sortedDates.filter(d => d < today).reverse(); // most recent past first

  const renderAppointmentCard = (a: Appointment) => (
    <div key={a.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        {/* Left: customer + service */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-zinc-900">{a.customerName}</p>
            <Badge status={a.status} />
            {a.discountCode && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                🏷 {a.discountCode}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">{a.customerPhone}</p>

          {/* Services */}
          <div className="mt-2">
            {a.servicesJson ? (
              <div className="space-y-0.5">
                {(JSON.parse(a.servicesJson) as { name: string; price: number; quantity?: number }[]).map((s, i) => (
                  <p key={i} className="text-sm text-zinc-700">
                    {s.name}{(s.quantity ?? 1) > 1 ? ` ×${s.quantity}` : ""} <span className="text-zinc-400">₹{s.price * (s.quantity ?? 1)}</span>
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-700">{a.serviceName}</p>
            )}
            {a.notes && <p className="mt-1 text-xs italic text-zinc-400">"{a.notes}"</p>}
          </div>
        </div>

        {/* Right: time + stylist + price */}
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-zinc-900">{formatTime(a.time)}</p>
          <p className="text-xs text-zinc-500">{a.staffName || "Any stylist"}</p>
          <p className="mt-1 text-sm font-semibold text-zinc-900">
            {formatCurrency(a.finalPrice ?? a.servicePrice)}
          </p>
          {a.totalDuration && a.totalDuration > 0 && (
            <p className="text-xs text-zinc-400">~{a.totalDuration} mins</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
        {a.status === "pending" && (
          <button onClick={() => updateStatus(a.id, "confirmed", a)} disabled={updating === a.id}
            className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 disabled:opacity-50">
            ✓ Confirm
          </button>
        )}
        {a.status === "confirmed" && (
          <button onClick={() => updateStatus(a.id, "completed", a)} disabled={updating === a.id}
            className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-100 disabled:opacity-50">
            ✓ Complete
          </button>
        )}
        {a.status !== "cancelled" && a.status !== "completed" && (
          <button onClick={() => updateStatus(a.id, "cancelled", a)} disabled={updating === a.id}
            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50">
            ✕ Cancel
          </button>
        )}
        {pendingWa[a.id] && (
          <a href={pendingWa[a.id].waLink} target="_blank" rel="noopener noreferrer"
            onClick={() => setPendingWa(prev => { const n = { ...prev }; delete n[a.id]; return n; })}
            className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700">
            <MessageCircle size={11} />
            Notify {pendingWa[a.id].status === "confirmed" ? "✅" : pendingWa[a.id].status === "cancelled" ? "❌" : "🙏"}
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {showWalkIn && (
        <WalkInModal
          staff={staff}
          onClose={() => setShowWalkIn(false)}
          onSuccess={() => { setShowWalkIn(false); load(); }}
        />
      )}
      <AdminNav />
      <div className="flex-1 p-4 md:p-8">

        {/* New booking alarm banner — flashing + persistent sound */}
        {newCount > 0 && (
          <div className="mb-4 rounded-xl shadow-2xl overflow-hidden animate-pulse border-2 border-green-400">
            <div className="bg-green-600 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-green-600 text-xl font-black animate-bounce shrink-0">
                    🔔
                  </div>
                  <div>
                    <p className="font-extrabold text-white text-base">
                      {newCount} New Booking{newCount > 1 ? "s" : ""}!
                    </p>
                    <p className="text-green-100 text-xs">Tap to view and confirm</p>
                  </div>
                </div>
                <button
                  onClick={() => { stopPersistentAlarm(); setNewCount(0); setFilter("pending"); }}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-green-700 hover:bg-green-50 shrink-0 shadow-md">
                  View & Stop Alarm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-zinc-900">
            Appointments {!loading && <span className="text-base font-normal text-zinc-400">({appointments.length})</span>}
          </h1>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => setShowWalkIn(true)}
              className="flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition">
              <Plus size={14} /> Walk-in
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-zinc-400">Loading appointments...</div>
        ) : (
          <>
            {/* Status filter pills */}
            <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {STATUSES.map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`rounded-xl border p-3 text-left transition ${filter === s ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white hover:border-zinc-400"}`}>
                  <p className="text-xl font-bold">{counts[s]}</p>
                  <p className="mt-0.5 text-xs capitalize opacity-70">{s}</p>
                </button>
              ))}
            </div>

            {/* Search + stylist */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
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
              <div className="space-y-8">

                {/* Upcoming dates */}
                {upcomingDates.map(date => (
                  <div key={date}>
                    <div className="mb-3 flex items-center gap-3">
                      <h2 className={`text-sm font-extrabold uppercase tracking-wider ${date === today ? "text-zinc-900" : "text-zinc-500"}`}>
                        {formatDateLabel(date)}
                      </h2>
                      <div className="flex-1 h-px bg-zinc-200" />
                      <span className="text-xs text-zinc-400">{grouped[date].length} booking{grouped[date].length > 1 ? "s" : ""}</span>
                    </div>
                    <div className="space-y-3">
                      {grouped[date].map(renderAppointmentCard)}
                    </div>
                  </div>
                ))}

                {/* Past dates (collapsed style) */}
                {pastDates.length > 0 && (
                  <div>
                    <div className="mb-3 flex items-center gap-3">
                      <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Past</h2>
                      <div className="flex-1 h-px bg-zinc-100" />
                    </div>
                    <div className="space-y-8">
                      {pastDates.map(date => (
                        <div key={date}>
                          <p className="mb-2 text-xs font-semibold text-zinc-400">{formatDateLabel(date)}</p>
                          <div className="space-y-3 opacity-60">
                            {grouped[date].map(renderAppointmentCard)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import AdminNav from "@/components/admin/AdminNav";
import { formatTime, getDateRange, formatDate } from "@/lib/utils";
import { Staff } from "@/types";

interface Slot {
  id: string;
  time: string;
  isAvailable: boolean;
}

const noCache = { cache: "no-store" as RequestCache };

export default function AdminSlotsPage() {

  // Panel 1 — Block by date/stylist
  const [selectedDate, setSelectedDate] = useState(getDateRange(14)[0] || "");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [dateSlots, setDateSlots] = useState<Slot[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<Set<string>>(new Set());
  const [dateLoading, setDateLoading] = useState(false);
  const [togglingDate, setTogglingDate] = useState<string | null>(null);

  // Panel 2 — Global enable/disable
  const [globalSlots, setGlobalSlots] = useState<Slot[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [togglingGlobal, setTogglingGlobal] = useState<string | null>(null);

  const fetchGlobalSlots = useCallback(async () => {
    setGlobalLoading(true);
    try {
      const res = await fetch("/api/slots", noCache);
      const data: Slot[] = await res.json();
      setGlobalSlots(data);
    } finally {
      setGlobalLoading(false);
    }
  }, []);

  const fetchDateSlots = useCallback(async () => {
    if (!selectedDate) return;
    setDateLoading(true);
    try {
      const staffParam = selectedStaffId ? `&staffId=${selectedStaffId}` : "";
      const [allRes, dateRes] = await Promise.all([
        fetch("/api/slots", noCache),
        fetch(`/api/slots?date=${selectedDate}${staffParam}`, noCache),
      ]);
      const allSlots: Slot[] = await allRes.json();
      const daySlots: Slot[] = await dateRes.json();

      const unavailable = new Set(daySlots.filter((s) => !s.isAvailable).map((s) => s.time));
      setDateSlots(allSlots.filter((s) => s.isAvailable)); // only show globally active slots
      setBlockedTimes(unavailable);
    } finally {
      setDateLoading(false);
    }
  }, [selectedDate, selectedStaffId]);

  useEffect(() => {
    fetch("/api/staff", noCache).then((r) => r.json()).then(setStaffList);
  }, []);

  useEffect(() => { fetchGlobalSlots(); }, [fetchGlobalSlots]);
  useEffect(() => { fetchDateSlots(); }, [fetchDateSlots]);

  const toggleBlock = async (time: string) => {
    const isBlocked = blockedTimes.has(time);
    setTogglingDate(time);
    try {
      await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isBlocked ? "unblock" : "block",
          date: selectedDate,
          time,
          staffId: selectedStaffId || undefined,
        }),
      });
      await fetchDateSlots();
    } finally {
      setTogglingDate(null);
    }
  };

  const toggleGlobal = async (slotId: string) => {
    setTogglingGlobal(slotId);
    try {
      const res = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", slotId }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to toggle slot");
        return;
      }
      await fetchGlobalSlots();
    } finally {
      setTogglingGlobal(null);
    }
  };

  const enableAll = async () => {
    const disabled = globalSlots.filter((s) => !s.isAvailable);
    for (const s of disabled) {
      await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", slotId: s.id }),
      });
    }
    await fetchGlobalSlots();
  };

  const disableAll = async () => {
    const enabled = globalSlots.filter((s) => s.isAvailable);
    for (const s of enabled) {
      await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", slotId: s.id }),
      });
    }
    await fetchGlobalSlots();
  };

  const selectedStaff = staffList.find((s) => s.id === selectedStaffId);
  const dates = getDateRange(14);

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminNav />

      <div className="flex-1 p-8">
        <h1 className="mb-1 text-2xl font-extrabold text-zinc-900">Manage Time Slots</h1>
        <p className="mb-8 text-sm text-zinc-500">Control which time slots are available for booking.</p>

        <div className="grid gap-8 lg:grid-cols-2">

          {/* Panel 1 — Block by Date */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-base font-bold text-zinc-900">Block Slots by Date</h2>
            <p className="mb-5 text-xs text-zinc-400">Block a specific time on a specific date only.</p>

            <div className="mb-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Date</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
                >
                  {dates.map((d) => <option key={d} value={d}>{formatDate(d)}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Stylist</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
                >
                  <option value="">All stylists (whole salon)</option>
                  {staffList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {selectedStaffId && (
              <div className="mb-4 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs text-zinc-300">
                Blocking for <strong className="text-white">{selectedStaff?.name}</strong> only.
              </div>
            )}

            {dateLoading ? (
              <div className="py-8 text-center text-sm text-zinc-400">Loading...</div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {dateSlots.map((slot) => {
                  const isBlocked = blockedTimes.has(slot.time);
                  const isToggling = togglingDate === slot.time;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => toggleBlock(slot.time)}
                      disabled={isToggling}
                      className={`rounded-xl border-2 px-2 py-3 text-xs font-semibold transition-all disabled:opacity-50 ${
                        isBlocked
                          ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-900 hover:bg-zinc-50"
                      }`}
                    >
                      {isToggling ? "..." : formatTime(slot.time)}
                      {!isToggling && isBlocked && " ✕"}
                    </button>
                  );
                })}
              </div>
            )}
            <p className="mt-3 text-xs text-zinc-400">
              <span className="inline-block mr-1 h-2 w-2 rounded-full bg-red-400" />Blocked &nbsp;
              <span className="inline-block mr-1 h-2 w-2 rounded-full bg-zinc-200 border border-zinc-300" />Available
            </p>
          </div>

          {/* Panel 2 — Global Enable/Disable */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-base font-bold text-zinc-900">Enable / Disable Slots</h2>
            <p className="mb-5 text-xs text-zinc-400">Disabled slots are hidden from the booking form on all dates, for all stylists.</p>

            {globalLoading ? (
              <div className="py-8 text-center text-sm text-zinc-400">Loading...</div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {globalSlots.map((slot) => {
                  const isToggling = togglingGlobal === slot.id;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => toggleGlobal(slot.id)}
                      disabled={isToggling}
                      className={`rounded-xl border-2 px-2 py-3 text-xs font-semibold transition-all disabled:opacity-50 ${
                        slot.isAvailable
                          ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                          : "border-zinc-300 bg-zinc-100 text-zinc-400 line-through hover:border-zinc-500"
                      }`}
                    >
                      {isToggling ? "..." : formatTime(slot.time)}
                    </button>
                  );
                })}
              </div>
            )}

            <p className="mt-3 text-xs text-zinc-400">
              <span className="inline-block mr-1 h-2 w-2 rounded-full bg-green-400" />Enabled &nbsp;
              <span className="inline-block mr-1 h-2 w-2 rounded-full bg-zinc-300" />Disabled
            </p>

            <div className="mt-5 flex gap-2 border-t border-zinc-100 pt-4">
              <button
                onClick={enableAll}
                className="flex-1 rounded-xl border-2 border-green-200 bg-green-50 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 transition"
              >
                Enable All
              </button>
              <button
                onClick={disableAll}
                className="flex-1 rounded-xl border-2 border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
              >
                Disable All
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

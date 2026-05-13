"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StickyBookButton() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [slotsToday, setSlotsToday] = useState<number | null>(null);
  const [pulse, setPulse] = useState(false);
  const [slotBlink, setSlotBlink] = useState(false);

  const isBookingPage = pathname?.includes("/booking");

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    const today = istNow.toISOString().split("T")[0];
    fetch(`/api/slots?date=${today}`)
      .then(r => r.json())
      .then((slots: { isAvailable: boolean }[]) => {
        setSlotsToday(slots.filter(s => s.isAvailable).length);
      })
      .catch(() => setSlotsToday(null));
  }, []);

  // Pulse ring every 4 seconds
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);
    }, 4000);
    return () => clearInterval(interval);
  }, [visible]);

  // Slot count blinks green every 6 seconds
  useEffect(() => {
    if (!visible || slotsToday === null) return;
    const interval = setInterval(() => {
      setSlotBlink(true);
      setTimeout(() => setSlotBlink(false), 800);
    }, 6000);
    return () => clearInterval(interval);
  }, [visible, slotsToday]);

  if (isBookingPage) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 md:bottom-6 md:left-auto md:right-6 md:w-auto ${visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}>
      <div className="relative">
        {/* Pulse ring — fires every 4 seconds */}
        {pulse && (
          <span className="absolute inset-0 rounded-none md:rounded-full animate-ping bg-zinc-700 opacity-40" />
        )}

        <Link href="/booking"
          className="relative flex w-full items-center justify-between gap-4 bg-zinc-900 px-6 py-4 shadow-2xl transition hover:bg-zinc-700 md:w-auto md:rounded-full md:justify-center">
          {/* Calendar icon */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-zinc-900">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Text */}
          <div className="flex-1 md:flex-none">
            <p className="text-sm font-bold text-white leading-tight">Book Appointment</p>
            {slotsToday !== null && slotsToday > 0 && (
              <p className={`text-xs font-semibold transition-colors duration-300 ${slotBlink ? "text-white" : "text-green-400"}`}>
                <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1 align-middle ${slotBlink ? "bg-white" : "bg-green-400"}`} />
                {slotsToday} slots open today
              </p>
            )}
            {slotsToday === 0 && (
              <p className="text-xs text-zinc-400">Check tomorrow's slots</p>
            )}
          </div>

          {/* Arrow */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 shrink-0 text-zinc-400">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

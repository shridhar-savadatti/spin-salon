"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StickyBookButton() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [slotsToday, setSlotsToday] = useState<number | null>(null);

  // Don't show on booking page itself
  const isBookingPage = pathname?.includes("/booking");

  useEffect(() => {
    // Show after scrolling 200px
    const handler = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    // Fetch today's available slots count
    const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    const today = istNow.toISOString().split("T")[0];
    fetch(`/api/slots?date=${today}`)
      .then(r => r.json())
      .then((slots: { isAvailable: boolean }[]) => {
        const available = slots.filter(s => s.isAvailable).length;
        setSlotsToday(available);
      })
      .catch(() => setSlotsToday(null));
  }, []);

  if (isBookingPage) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 md:bottom-6 md:left-auto md:right-6 md:w-auto ${visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}>
      <Link href="/booking"
        className="flex w-full items-center justify-center gap-3 bg-zinc-900 px-6 py-4 shadow-2xl transition hover:bg-zinc-700 md:w-auto md:rounded-full">
        <div>
          <p className="text-sm font-bold text-white leading-tight">Book Appointment</p>
          {slotsToday !== null && slotsToday > 0 && (
            <p className="text-xs text-green-400">{slotsToday} slots available today</p>
          )}
          {slotsToday === 0 && (
            <p className="text-xs text-zinc-400">Check tomorrow's slots</p>
          )}
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-zinc-900">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </Link>
    </div>
  );
}

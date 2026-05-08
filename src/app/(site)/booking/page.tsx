"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { SERVICES, SERVICE_CATEGORIES } from "@/lib/services-data";
import { formatCurrency, formatDate, formatTime, getDateRange, buildWhatsAppUrl } from "@/lib/utils";
import { TimeSlot, Staff } from "@/types";
import { CheckCircle, Clock, ChevronRight, Search, X, ArrowLeft } from "lucide-react";
import PageAnalytics from "@/components/PageAnalytics";

const WHATSAPP_NUMBER = "919164363131";
const AVAILABLE_DATES = getDateRange(21);

type Step = 1 | 2 | 3 | 4 | 5;

const CATEGORY_BANNERS: Record<string, { image: string; position: string; subtitle: string }> = {
  "Women's Hair":   { image: "/images/women-hair.jpg",   position: "50% 20%", subtitle: "Cuts, colour, spa & treatments" },
  "Men's Hair":     { image: "/images/men-hair.jpg",     position: "50% 30%", subtitle: "Cuts, beard, colour & grooming" },
  "Skincare":       { image: "/images/skincare.jpg",     position: "50% 20%", subtitle: "Facials, clean-ups, de-tan & bleach" },
  "Waxing":         { image: "/images/facial.jpg",       position: "50% 40%", subtitle: "Honey, chocolate & liposoluble wax" },
  "Nails":          { image: "/images/nails.jpg",        position: "50% 50%", subtitle: "Manicure, pedicure, gel & nail art" },
  "Bridal & Groom": { image: "/images/bride-photo.jpg",  position: "50% 20%", subtitle: "Complete bridal & groom packages" },
};

function BookingForm() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service") || "";
  const preselectedCategory = searchParams.get("category") || "";

  const defaultCategory =
    preselectedCategory ||
    (preselectedService ? SERVICES.find(s => s.id === preselectedService)?.category || SERVICE_CATEGORIES[0] : SERVICE_CATEGORIES[0]);

  const [step, setStep] = useState<Step>(1);
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const [search, setSearch] = useState("");
  const [serviceId, setServiceId] = useState(preselectedService);
  const [staffId, setStaffId] = useState("");
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [confirmedStaffName, setConfirmedStaffName] = useState("");
  const [error, setError] = useState("");

  const banner = CATEGORY_BANNERS[activeCategory];
  const filteredServices = SERVICES.filter(s =>
    s.category === activeCategory &&
    (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase()))
  );
  const selectedService = SERVICES.find(s => s.id === serviceId);
  const selectedStaff = staffList.find(s => s.id === staffId);

  // Scroll to top on every step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    fetch("/api/staff").then(r => r.json()).then(setStaffList);
  }, []);

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    setTime("");
    const url = staffId ? `/api/slots?date=${date}&staffId=${staffId}` : `/api/slots?date=${date}`;
    fetch(url).then(r => r.json()).then((data: TimeSlot[]) => {
      // For today: hide slots within 1 hour of current time
      const today = new Date().toISOString().split("T")[0];
      if (date === today) {
        const now = new Date();
        const cutoff = new Date(now.getTime() + 60 * 60 * 1000); // now + 1 hour
        const cutoffMins = cutoff.getHours() * 60 + cutoff.getMinutes();
        const filtered = data.map(slot => {
          const [h, m] = slot.time.split(":").map(Number);
          const slotMins = h * 60 + m;
          return slotMins < cutoffMins ? { ...slot, isAvailable: false } : slot;
        });
        setSlots(filtered);
      } else {
        setSlots(data);
      }
      setLoadingSlots(false);
    });
  }, [date, staffId]);

  const handleBooking = async () => {
    if (!form.name || !form.phone) { setError("Please fill in your name and phone number."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: form.name, customerPhone: form.phone, serviceId, date, time, notes: form.notes, staffId: staffId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      setBookingId(data.id);
      setConfirmedStaffName(data.staffName || "");
      setStep(5);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const goToStep = (s: Step) => {
    setStep(s);
  };

  const whatsappMsg = `Hi! I just booked at Spin Unisex Salon, Kudlu Bengaluru.\n\nService: ${selectedService?.name}\nStylist: ${confirmedStaffName}\nDate: ${date ? formatDate(date) : ""}\nTime: ${time ? formatTime(time) : ""}\nName: ${form.name}\nBooking ID: ${bookingId}`;
  const stepLabels = ["Service", "Stylist", "Date & Time", "Your Details"];

  const resetAll = () => {
    setStep(1); setServiceId(""); setStaffId(""); setDate(""); setTime("");
    setForm({ name: "", phone: "", notes: "" }); setBookingId(""); setConfirmedStaffName("");
    setActiveCategory(SERVICE_CATEGORIES[0]); setSearch("");
  };

  // Sticky footer content per step
  const renderStickyFooter = () => {
    if (step === 5) return null;

    if (step === 1) {
      return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            {selectedService ? (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900">{selectedService.name}</p>
                  <p className="text-xs text-zinc-500">{formatCurrency(selectedService.price)}* · {selectedService.duration}m</p>
                </div>
                <Button onClick={() => goToStep(2)} className="shrink-0">
                  Continue <ChevronRight size={16} />
                </Button>
              </>
            ) : (
              <>
                <p className="flex-1 text-sm text-zinc-400">Select a service to continue</p>
                <Button disabled className="shrink-0">
                  Continue <ChevronRight size={16} />
                </Button>
              </>
            )}
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl gap-3">
            <Button variant="ghost" onClick={() => goToStep(1)} className="flex-1 gap-1">
              <ArrowLeft size={15} /> Back
            </Button>
            <Button onClick={() => goToStep(3)} className="flex-1">
              Continue <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl gap-3">
            <Button variant="ghost" onClick={() => goToStep(2)} className="flex-1 gap-1">
              <ArrowLeft size={15} /> Back
            </Button>
            <Button disabled={!date || !time} onClick={() => goToStep(4)} className="flex-1">
              Continue <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl gap-3">
            <Button variant="ghost" onClick={() => goToStep(3)} className="flex-1 gap-1">
              <ArrowLeft size={15} /> Back
            </Button>
            <Button loading={submitting} onClick={handleBooking} className="flex-1">
              Confirm Booking
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    // pb-20 gives space so content isn't hidden behind sticky footer
    <div className="pb-24">
      <PageAnalytics page="booking" />

      {/* Sticky footer */}
      {renderStickyFooter()}

      {/* Progress bar */}
      {step < 5 && (
        <div className="mx-auto mb-8 max-w-2xl px-4">
          <div className="flex items-center">
            {stepLabels.map((label, i) => {
              const s = (i + 1) as Step;
              const active = step === s;
              const done = step > s;
              return (
                <div key={label} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ring-2 transition-all ${done ? "bg-zinc-900 text-white ring-zinc-900" : active ? "bg-zinc-900 text-white ring-zinc-900 shadow-lg" : "bg-white text-zinc-400 ring-zinc-200"}`}>
                      {done ? "✓" : s}
                    </div>
                    <span className={`mt-2 text-xs font-medium ${active ? "text-zinc-900" : done ? "text-zinc-500" : "text-zinc-400"}`}>{label}</span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div className={`mx-1 mb-5 h-0.5 flex-1 transition-all ${step > s ? "bg-zinc-900" : "bg-zinc-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Step 1: Service ───────────────────────────────────────── */}
      {step === 1 && (
        <div>
          {/* Full-bleed category background */}
          <div className="relative w-full overflow-hidden" style={{ height: "55vh", minHeight: 320 }}>
            {activeCategory === "Bridal & Groom" ? (
              <div className="flex h-full w-full">
                <div className="relative flex-1 overflow-hidden">
                  <Image src="/images/bride-photo.jpg" alt="Bridal makeup and hair at Spin Unisex Salon Kudlu Bengaluru" fill style={{ objectFit: "cover", objectPosition: "50% 20%" }} priority />
                </div>
                <div className="relative flex-1 overflow-hidden">
                  <Image src="/images/groom-photo.jpg" alt="Groom package at Spin Unisex Salon Kudlu near HSR Layout" fill style={{ objectFit: "cover", objectPosition: "50% 10%" }} priority />
                </div>
              </div>
            ) : (
              <Image src={banner?.image || "/images/women-hair.jpg"} alt={activeCategory + " services at Spin Unisex Salon Kudlu Bengaluru"} fill style={{ objectFit: "cover", objectPosition: banner?.position || "50% 30%" }} priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {/* Category title — centred in image */}
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-white drop-shadow-lg sm:text-4xl">{activeCategory}</h2>
                {banner && <p className="mt-2 text-sm text-white/70">{banner.subtitle}</p>}
              </div>
            </div>
          </div>

          {/* Category tabs — BELOW the image so sticky footer never covers them */}
          <div className="bg-zinc-900 px-4 py-3">
            <div className="mx-auto max-w-2xl">
              <div className="flex flex-wrap gap-2">
                {SERVICE_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setServiceId(""); setSearch(""); }}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                      activeCategory === cat
                        ? "border-white bg-white text-zinc-900"
                        : "border-zinc-600 text-zinc-400 hover:border-zinc-300 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search + services */}
          <div className="mx-auto max-w-2xl px-4 pt-6">
            <div className="mb-5 flex items-center gap-2 rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 shadow-sm transition-all focus-within:border-zinc-900 focus-within:shadow-md">
              <Search size={16} className="shrink-0 text-zinc-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={`Search in ${activeCategory}...`}
                className="flex-1 text-sm text-zinc-900 placeholder-zinc-400 outline-none" />
              {search && (
                <button onClick={() => setSearch("")} className="text-zinc-400 hover:text-zinc-700"><X size={14} /></button>
              )}
            </div>

            {filteredServices.length === 0 ? (
              <p className="py-10 text-center text-sm text-zinc-400">No services found for &ldquo;{search}&rdquo;</p>
            ) : (
              <div className="space-y-2">
                {filteredServices.map(s => (
                  <button key={s.id} onClick={() => setServiceId(s.id)}
                    className={`w-full rounded-xl border-2 p-4 text-left transition-all ${serviceId === s.id ? "border-zinc-900 bg-zinc-900 shadow-md" : "border-zinc-200 bg-white hover:border-zinc-400"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className={`font-semibold ${serviceId === s.id ? "text-white" : "text-zinc-900"}`}>{s.name}</p>
                        <p className={`mt-0.5 text-xs ${serviceId === s.id ? "text-zinc-300" : "text-zinc-500"}`}>{s.description}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`font-bold ${serviceId === s.id ? "text-white" : "text-zinc-900"}`}>{formatCurrency(s.price)}*</p>
                        <p className={`mt-0.5 flex items-center justify-end gap-1 text-xs ${serviceId === s.id ? "text-zinc-300" : "text-zinc-400"}`}>
                          <Clock size={10} />{s.duration}m
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs text-zinc-400">* Prices are onwards. GST 5% applicable.</p>
          </div>
        </div>
      )}

      {/* ── Steps 2–5 ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-2xl px-4">

        {/* Step 2: Stylist */}
        {step === 2 && (
          <div>
            <h2 className="mb-2 text-2xl font-extrabold text-zinc-900">Choose a Stylist</h2>
            <p className="mb-6 text-sm text-zinc-500">Pick someone specific or let us assign the next available.</p>
            <div className="space-y-3">
              <button onClick={() => setStaffId("")}
                className={`w-full rounded-xl border-2 p-4 text-left transition-all ${staffId === "" ? "border-zinc-900 bg-zinc-900 shadow-md" : "border-zinc-200 bg-white hover:border-zinc-400"}`}>
                <p className={`font-semibold ${staffId === "" ? "text-white" : "text-zinc-900"}`}>No Preference</p>
                <p className={`mt-0.5 text-xs ${staffId === "" ? "text-zinc-300" : "text-zinc-500"}`}>We'll assign the next available stylist</p>
              </button>
              {staffList.map(staff => (
                <button key={staff.id} onClick={() => setStaffId(staff.id)}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all ${staffId === staff.id ? "border-zinc-900 bg-zinc-900 shadow-md" : "border-zinc-200 bg-white hover:border-zinc-400"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${staffId === staff.id ? "bg-white text-zinc-900" : "bg-zinc-900 text-white"}`}>
                      {staff.name[0]}
                    </div>
                    <div>
                      <p className={`font-semibold ${staffId === staff.id ? "text-white" : "text-zinc-900"}`}>{staff.name}</p>
                      <p className={`mt-0.5 text-xs ${staffId === staff.id ? "text-zinc-300" : "text-zinc-500"}`}>{staff.role}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && (
          <div>
            <h2 className="mb-2 text-2xl font-extrabold text-zinc-900">Pick a Date & Time</h2>
            {selectedStaff && <p className="mb-4 text-sm text-zinc-500">Showing availability for <span className="font-semibold text-zinc-900">{selectedStaff.name}</span></p>}
            <div className="mb-6">
              <Select label="Select Date" value={date} onChange={e => setDate(e.target.value)}>
                <option value="">Choose a date...</option>
                {AVAILABLE_DATES.map(d => <option key={d} value={d}>{formatDate(d)}</option>)}
              </Select>
            </div>
            {date && (
              <div>
                <p className="mb-3 text-sm font-semibold text-zinc-700">Available Times</p>
                {loadingSlots ? (
                  <div className="py-8 text-center text-zinc-400">Loading slots...</div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slots.map(slot => (
                      <button key={slot.id} disabled={!slot.isAvailable} onClick={() => setTime(slot.time)}
                        className={`rounded-xl border-2 p-3 text-sm font-semibold transition-all ${!slot.isAvailable ? "cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-300 line-through" : time === slot.time ? "border-zinc-900 bg-zinc-900 text-white shadow-md" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-500"}`}>
                        {formatTime(slot.time)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Details */}
        {step === 4 && (
          <div>
            <h2 className="mb-2 text-2xl font-extrabold text-zinc-900">Your Details</h2>
            <div className="mb-6 rounded-xl border-2 border-zinc-900 bg-zinc-900 p-4">
              <p className="font-semibold text-white">{selectedService?.name}</p>
              <p className="mt-0.5 text-sm text-zinc-300">
                {selectedStaff ? selectedStaff.name : "Any stylist"} · {formatDate(date)} at {formatTime(time)} · {formatCurrency(selectedService?.price || 0)}*
              </p>
            </div>
            <div className="space-y-4">
              <Input label="Full Name" id="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
              <Input label="Phone Number" id="phone" type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0120-524-4768" />
              <div>
                <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-zinc-700">Notes (optional)</label>
                <textarea id="notes" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any special requests..."
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 transition focus:border-zinc-900 focus:outline-none" />
              </div>
            </div>
            {error && <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600">{error}</p>}
          </div>
        )}

        {/* Step 5: Confirmed */}
        {step === 5 && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="mb-2 text-3xl font-extrabold text-zinc-900">Booking Confirmed!</h2>
            <p className="mb-8 text-zinc-500">We'll reach out to confirm shortly.</p>
            <div className="mb-8 overflow-hidden rounded-2xl border-2 border-zinc-900">
              <div className="bg-zinc-900 px-6 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Booking Summary</p>
              </div>
              <div className="divide-y divide-zinc-100 bg-white px-6 py-4">
                {[
                  { label: "Booking ID", value: bookingId },
                  { label: "Service", value: selectedService?.name },
                  { label: "Stylist", value: confirmedStaffName || "Any available" },
                  { label: "Date", value: formatDate(date) },
                  { label: "Time", value: formatTime(time) },
                  { label: "Name", value: form.name },
                  { label: "Phone", value: form.phone },
                  { label: "Price", value: `${formatCurrency(selectedService?.price || 0)}*` },
                ].map(item => (
                  <div key={item.label} className="flex justify-between gap-4 py-2.5 text-sm">
                    <dt className="text-zinc-500">{item.label}</dt>
                    <dd className="text-right font-semibold text-zinc-900">{item.value}</dd>
                  </div>
                ))}
              </div>
            </div>
            <a href={buildWhatsAppUrl(WHATSAPP_NUMBER, whatsappMsg)} target="_blank" rel="noopener noreferrer"
              className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-green-700">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.123 1.527 5.855L0 24l6.335-1.506A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.504-5.17-1.385l-.37-.218-3.762.895.953-3.65-.24-.383A9.964 9.964 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" /></svg>
              Share via WhatsApp
            </a>
            <Button variant="outline" className="w-full" onClick={resetAll}>Book Another Appointment</Button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <>
      <div className="bg-zinc-900 px-4 pt-32 pb-12 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">Reserve Your Spot</p>
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Book an Appointment</h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">Choose your service, pick a time, done in under 2 minutes.</p>
      </div>
      <section className="bg-zinc-50 pb-16 pt-10">
        <Suspense fallback={<div className="py-16 text-center text-zinc-400">Loading...</div>}>
          <BookingForm />
        </Suspense>
      </section>
    </>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { SERVICES, SERVICE_CATEGORIES } from "@/lib/services-data";
import { formatCurrency, formatDate, formatTime, getDateRange, buildWhatsAppUrl } from "@/lib/utils";
import { TimeSlot, Staff, AppliedOffer, SelectedService } from "@/types";
import { CheckCircle, Clock, ChevronRight, Search, X, ArrowLeft, Tag, Loader } from "lucide-react";
import PageAnalytics from "@/components/PageAnalytics";

const WHATSAPP_NUMBER = "919164363131";
const ADMIN_PHONE = "919164363131";
const AVAILABLE_DATES = getDateRange(21);
const GST_RATE = 0.05; // 5%

type Step = 1 | 2 | 3 | 4 | 5;

function calcGst(amount: number) {
  return Math.round(amount * GST_RATE);
}

function BookingForm() {
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams.get("service") || "";
  const preselectedCategory = searchParams.get("category") || "";

  const defaultCategory = preselectedCategory ||
    (preselectedServiceId ? SERVICES.find(s => s.id === preselectedServiceId)?.category || SERVICE_CATEGORIES[0] : SERVICE_CATEGORIES[0]);

  const [step, setStep] = useState<Step>(1);
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const [search, setSearch] = useState("");
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(() => {
    if (preselectedServiceId) {
      const s = SERVICES.find(sv => sv.id === preselectedServiceId);
      if (s) return [{ id: s.id, name: s.name, price: s.price, duration: s.duration, category: s.category }];
    }
    return [];
  });
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
  const [promoCode, setPromoCode] = useState("");
  const [appliedOffer, setAppliedOffer] = useState<AppliedOffer | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");

  const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const discountedSubtotal = appliedOffer ? appliedOffer.finalPrice : subtotal;
  const gstAmount = calcGst(discountedSubtotal);
  const grandTotal = discountedSubtotal + gstAmount;
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
  const selectedStaff = staffList.find(s => s.id === staffId);
  const filteredServices = SERVICES.filter(s =>
    s.category === activeCategory &&
    (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);
  useEffect(() => { fetch("/api/staff").then(r => r.json()).then(setStaffList); }, []);

  // Auto-scroll helper — accounts for fixed navbar (64px) + breathing room
  const scrollTo = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }
    }, 150);
  };

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    setTime("");
    const url = staffId ? `/api/slots?date=${date}&staffId=${staffId}` : `/api/slots?date=${date}`;
    fetch(url).then(r => r.json()).then((data: TimeSlot[]) => {
      const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
      const today = istNow.toISOString().split("T")[0];
      if (date === today) {
        const cutoffIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000 + 60 * 60 * 1000);
        const cutoffMins = cutoffIST.getUTCHours() * 60 + cutoffIST.getUTCMinutes();
        setSlots(data.map(slot => {
          const [h, m] = slot.time.split(":").map(Number);
          return h * 60 + m < cutoffMins ? { ...slot, isAvailable: false } : slot;
        }));
      } else {
        setSlots(data);
      }
      setLoadingSlots(false);
      // After slots load, scroll to them
      scrollTo("time-slots-section");
    });
  }, [date, staffId]);

  const toggleService = (s: typeof SERVICES[0]) => {
    setSelectedServices(prev => {
      const exists = prev.find(p => p.id === s.id);
      const next = exists ? prev.filter(p => p.id !== s.id) : [...prev, { id: s.id, name: s.name, price: s.price, duration: s.duration, category: s.category }];
      // Scroll to selected summary when first service is added
      if (!exists && prev.length === 0) scrollTo("selected-summary");
      return next;
    });
    setAppliedOffer(null);
    setPromoError("");
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    if (!form.phone) { setPromoError("Enter your phone number first"); return; }
    if (subtotal === 0) { setPromoError("Select at least one service first"); return; }
    setPromoLoading(true);
    setPromoError("");
    setAppliedOffer(null);
    try {
      const res = await fetch("/api/validate-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode, phone: form.phone, servicePrice: grandTotal,
          category: selectedServices.length === 1 ? selectedServices[0].category : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setPromoError(data.error); }
      else { setAppliedOffer({ code: data.code, description: data.description, discountAmount: data.discountAmount, finalPrice: data.finalPrice }); }
    } catch { setPromoError("Could not apply code. Try again."); }
    finally { setPromoLoading(false); }
  };

  const handleBooking = async () => {
    if (!form.name || !form.phone) { setError("Please fill in your name and phone number."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name, customerPhone: form.phone,
          selectedServices, date, time, notes: form.notes,
          staffId: staffId || undefined,
          discountCode: appliedOffer?.code,
          discountAmount: appliedOffer?.discountAmount || 0,
          finalPrice: grandTotal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      setBookingId(data.id);
      setConfirmedStaffName(data.staffName || "");
      setStep(5);
      scrollTo("booking-confirmed");

      // Notify admin
      const serviceList = selectedServices.map(s => `• ${s.name} (₹${s.price})`).join("\n");
      const adminMsg = `🔔 *New Booking Request*\n\n👤 ${form.name}\n📞 ${form.phone}\n\n💇 Services:\n${serviceList}\n\n💰 Subtotal: ₹${subtotal}\n🧾 GST (5%): ₹${gstAmount}\n💵 Total: ₹${grandTotal}${appliedOffer ? ` (after ${appliedOffer.code})` : ""}\n⏱ ~${totalDuration} mins\n📅 ${date} at ${time}\n🆔 ID: ${data.id}`;
      window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(adminMsg)}`, "_blank");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setStep(1); setSelectedServices([]); setStaffId(""); setDate(""); setTime("");
    setForm({ name: "", phone: "", notes: "" }); setBookingId(""); setConfirmedStaffName("");
    setActiveCategory(SERVICE_CATEGORIES[0]); setSearch("");
    setPromoCode(""); setAppliedOffer(null); setPromoError("");
  };

  const whatsappMsg = `Hi! I just booked at Spin Unisex Salon, Kudlu Bengaluru.\n\nServices: ${selectedServices.map(s => s.name).join(", ")}\nStylist: ${confirmedStaffName}\nDate: ${date ? formatDate(date) : ""}\nTime: ${time ? formatTime(time) : ""}\nTotal (incl. 5% GST): ₹${grandTotal}\nName: ${form.name}\nBooking ID: ${bookingId}`;
  const stepLabels = ["Services", "Stylist", "Date & Time", "Your Details"];

  // Sticky footer
  const renderStickyFooter = () => {
    if (step === 5) return null;
    const base = "fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm";
    const inner = "mx-auto flex max-w-2xl gap-3";

    if (step === 1) return (
      <div className={base}>
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          {selectedServices.length > 0 ? (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-900">
                  {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""} · {formatCurrency(subtotal)}
                </p>
                <p className="text-xs text-zinc-400">+5% GST = {formatCurrency(grandTotal)} · ~{totalDuration} mins</p>
              </div>
              <Button onClick={() => setStep(2)} className="shrink-0">Continue <ChevronRight size={16} /></Button>
            </>
          ) : (
            <>
              <p className="flex-1 text-sm text-zinc-400">Select at least one service</p>
              <Button disabled className="shrink-0">Continue <ChevronRight size={16} /></Button>
            </>
          )}
        </div>
      </div>
    );
    if (step === 2) return (
      <div className={base}><div className={inner}>
        <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 gap-1"><ArrowLeft size={15} /> Back</Button>
        <Button onClick={() => setStep(3)} className="flex-1">Continue <ChevronRight size={16} /></Button>
      </div></div>
    );
    if (step === 3) return (
      <div className={base}><div className={inner}>
        <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 gap-1"><ArrowLeft size={15} /> Back</Button>
        <Button disabled={!date || !time} onClick={() => setStep(4)} className="flex-1">Continue <ChevronRight size={16} /></Button>
      </div></div>
    );
    if (step === 4) return (
      <div className={base}><div className={inner}>
        <Button variant="ghost" onClick={() => setStep(3)} className="flex-1 gap-1"><ArrowLeft size={15} /> Back</Button>
        <Button loading={submitting} onClick={handleBooking} className="flex-1">Confirm Booking</Button>
      </div></div>
    );
  };

  return (
    <div className="pb-24">
      <PageAnalytics page="booking" />
      {renderStickyFooter()}

      {/* Progress */}
      {step < 5 && (
        <div className="mx-auto mb-6 max-w-2xl px-4">
          <div className="flex items-center">
            {stepLabels.map((label, i) => {
              const s = (i + 1) as Step;
              const active = step === s, done = step > s;
              return (
                <div key={label} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ring-2 transition-all ${done ? "bg-zinc-900 text-white ring-zinc-900" : active ? "bg-zinc-900 text-white ring-zinc-900" : "bg-white text-zinc-400 ring-zinc-200"}`}>
                      {done ? "✓" : s}
                    </div>
                    <span className={`mt-1.5 text-xs font-medium ${active ? "text-zinc-900" : done ? "text-zinc-500" : "text-zinc-400"}`}>{label}</span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div className={`mx-1 mb-4 h-0.5 flex-1 ${step > s ? "bg-zinc-900" : "bg-zinc-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP 1: Services ── */}
      {step === 1 && (
        <div className="mx-auto max-w-2xl px-4">
          {/* Category tabs */}
          <div className="mb-4 flex flex-wrap gap-2">
            {SERVICE_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => { setActiveCategory(cat); setSearch(""); }}
                className={`rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-all ${activeCategory === cat ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"}`}>
                {cat}
                {selectedServices.filter(s => s.category === cat).length > 0 && (
                  <span className="ml-1.5 rounded-full bg-green-500 px-1.5 py-0.5 text-xs text-white">
                    {selectedServices.filter(s => s.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Selected summary */}
          {selectedServices.length > 0 && (
            <div id="selected-summary" className="mb-4 rounded-xl bg-zinc-900 px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Selected ({selectedServices.length})</p>
              <div className="flex flex-wrap gap-2">
                {selectedServices.map(s => (
                  <div key={s.id} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                    {s.name} · {formatCurrency(s.price)}
                    <button onClick={() => toggleService(SERVICES.find(sv => sv.id === s.id)!)} className="ml-1 text-zinc-400 hover:text-white"><X size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-4 flex items-center gap-2 rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 shadow-sm transition-all focus-within:border-zinc-900">
            <Search size={16} className="shrink-0 text-zinc-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`Search in ${activeCategory}...`}
              className="flex-1 text-sm text-zinc-900 placeholder-zinc-400 outline-none" />
            {search && <button onClick={() => setSearch("")} className="text-zinc-400 hover:text-zinc-700"><X size={14} /></button>}
          </div>

          {/* Services list */}
          {filteredServices.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-400">No services found for "{search}"</p>
          ) : (
            <div className="space-y-2">
              {filteredServices.map(s => {
                const isSelected = selectedServices.some(p => p.id === s.id);
                return (
                  <button key={s.id} onClick={() => toggleService(s)}
                    className={`w-full rounded-xl border-2 p-4 text-left transition-all ${isSelected ? "border-zinc-900 bg-zinc-900 shadow-md" : "border-zinc-200 bg-white hover:border-zinc-400"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${isSelected ? "border-white bg-white" : "border-zinc-300"}`}>
                          {isSelected && <span className="text-zinc-900 text-xs font-bold">✓</span>}
                        </div>
                        <div>
                          <p className={`font-semibold ${isSelected ? "text-white" : "text-zinc-900"}`}>{s.name}</p>
                          <p className={`mt-0.5 text-xs ${isSelected ? "text-zinc-300" : "text-zinc-500"}`}>{s.description}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`font-bold ${isSelected ? "text-white" : "text-zinc-900"}`}>{formatCurrency(s.price)}*</p>
                        <p className={`mt-0.5 flex items-center justify-end gap-1 text-xs ${isSelected ? "text-zinc-300" : "text-zinc-400"}`}>
                          <Clock size={10} />{s.duration}m
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          <p className="mt-3 text-xs text-zinc-400">* Prices are onwards. 5% GST applicable on final bill.</p>
        </div>
      )}

      {/* ── STEPS 2–5 ── */}
      <div className="mx-auto max-w-2xl px-4">

        {/* Step 2: Stylist */}
        {step === 2 && (
          <div>
            <h2 className="mb-2 text-2xl font-extrabold text-zinc-900">Choose a Stylist</h2>
            <p className="mb-6 text-sm text-zinc-500">Pick someone or let us assign the next available.</p>
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
            {totalDuration > 0 && <p className="mb-4 text-xs text-zinc-400">Total duration ~{totalDuration} mins.</p>}
            <div className="mb-6">
              <Select label="Select Date" value={date} onChange={e => setDate(e.target.value)}>
                <option value="">Choose a date...</option>
                {AVAILABLE_DATES.map(d => <option key={d} value={d}>{formatDate(d)}</option>)}
              </Select>
            </div>
            {date && (
              <div>
                <div id="time-slots-section" />
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
            <h2 className="mb-4 text-2xl font-extrabold text-zinc-900">Your Details</h2>

            {/* Bill summary */}
            <div className="mb-5 rounded-xl border-2 border-zinc-900 bg-zinc-900 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Bill Summary</p>
              {selectedServices.map(s => (
                <div key={s.id} className="flex justify-between py-1 text-sm">
                  <span className="text-zinc-300">{s.name}</span>
                  <span className="font-semibold text-white">{formatCurrency(s.price)}</span>
                </div>
              ))}
              {appliedOffer && (
                <div className="flex justify-between py-1 text-sm text-green-400">
                  <span>Discount ({appliedOffer.code})</span>
                  <span>-{formatCurrency(appliedOffer.discountAmount)}</span>
                </div>
              )}
              <div className="mt-2 border-t border-zinc-700 pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-white">{formatCurrency(discountedSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">GST (5%)</span>
                  <span className="text-white">{formatCurrency(gstAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-zinc-600 pt-2">
                  <span className="text-white">Total to Pay</span>
                  <span className="text-white">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                {selectedStaff ? selectedStaff.name : "Any stylist"} · {formatDate(date)} at {formatTime(time)} · ~{totalDuration} mins
              </p>
            </div>

            <div className="space-y-4">
              <Input label="Full Name" id="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
              <Input label="Phone Number" id="phone" type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 91643 63131" />
              <div>
                <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-zinc-700">Notes (optional)</label>
                <textarea id="notes" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any special requests..."
                  className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 transition focus:border-zinc-900 focus:outline-none" />
              </div>
            </div>

            {/* Promo code */}
            <div className="mt-4 rounded-xl border-2 border-zinc-200 p-4">
              <p className="mb-2 text-sm font-semibold text-zinc-700 flex items-center gap-1.5"><Tag size={14} /> Promo Code</p>
              {appliedOffer ? (
                <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-green-700">✅ {appliedOffer.code} applied!</p>
                      <p className="text-xs text-green-600">You save {formatCurrency(appliedOffer.discountAmount)}</p>
                    </div>
                    <button onClick={() => { setAppliedOffer(null); setPromoCode(""); }} className="text-xs text-zinc-400 hover:text-red-500">Remove</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={promoCode} onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(""); }}
                    placeholder="Enter promo code"
                    className="flex-1 rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm font-mono font-bold uppercase text-zinc-900 placeholder:font-normal placeholder:normal-case focus:border-zinc-900 focus:outline-none" />
                  <button onClick={applyPromoCode} disabled={promoLoading || !promoCode.trim()}
                    className="shrink-0 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50 flex items-center gap-1">
                    {promoLoading ? <Loader size={14} className="animate-spin" /> : "Apply"}
                  </button>
                </div>
              )}
              {promoError && <p className="mt-2 text-xs text-red-500">{promoError}</p>}
            </div>

            {error && <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600">{error}</p>}
          </div>
        )}

        {/* Step 5: Confirmed */}
        {step === 5 && (
          <div id="booking-confirmed" className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="mb-2 text-3xl font-extrabold text-zinc-900">Booking Requested!</h2>
            <p className="mb-8 text-lg font-bold text-zinc-800">We will reach out to confirm shortly.</p>

            <div className="mb-8 overflow-hidden rounded-2xl border-2 border-zinc-900 text-left">
              <div className="bg-zinc-900 px-6 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Booking Summary</p>
              </div>
              <div className="bg-white px-6 py-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Services</p>
                {selectedServices.map(s => (
                  <div key={s.id} className="flex justify-between py-1.5 border-b border-zinc-50 text-sm">
                    <span className="text-zinc-700">{s.name}</span>
                    <span className="font-semibold text-zinc-900">{formatCurrency(s.price)}</span>
                  </div>
                ))}
                {appliedOffer && (
                  <div className="flex justify-between py-1.5 text-sm text-green-600">
                    <span>Discount ({appliedOffer.code})</span>
                    <span>-{formatCurrency(appliedOffer.discountAmount)}</span>
                  </div>
                )}
                <div className="mt-2 pt-2 border-t border-zinc-200 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-zinc-500">Subtotal</span><span className="font-semibold">{formatCurrency(discountedSubtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">GST (5%)</span><span className="font-semibold">{formatCurrency(gstAmount)}</span></div>
                  <div className="flex justify-between text-base font-bold border-t border-zinc-200 pt-2">
                    <span className="text-zinc-900">Total</span>
                    <span className="text-zinc-900">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-100 space-y-1.5 text-sm">
                  {[
                    { label: "Stylist", value: confirmedStaffName || "Any available" },
                    { label: "Date", value: formatDate(date) },
                    { label: "Time", value: formatTime(time) },
                    { label: "Name", value: form.name },
                    { label: "Phone", value: form.phone },
                    { label: "Booking ID", value: bookingId },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between gap-4">
                      <dt className="text-zinc-500">{item.label}</dt>
                      <dd className="text-right font-semibold text-zinc-900">{item.value}</dd>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <a href={`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(`🔔 Booking ID: ${bookingId} — ${form.name} (${form.phone}) — ${selectedServices.map(s => s.name).join(", ")} — ${date} at ${time} — Total ₹${grandTotal}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-zinc-700">
              📲 Notify Salon on WhatsApp
            </a>
            <a href={buildWhatsAppUrl(WHATSAPP_NUMBER, whatsappMsg)} target="_blank" rel="noopener noreferrer"
              className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-green-700">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.123 1.527 5.855L0 24l6.335-1.506A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.504-5.17-1.385l-.37-.218-3.762.895.953-3.65-.24-.383A9.964 9.964 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" /></svg>
              Share Booking via WhatsApp
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
      {/* pt-20 clears the fixed navbar, no hero text needed */}
      <section className="bg-zinc-50 pb-16 pt-[88px]">
        <Suspense fallback={<div className="py-16 text-center text-zinc-400">Loading...</div>}>
          <BookingForm />
        </Suspense>
      </section>
    </>
  );
}

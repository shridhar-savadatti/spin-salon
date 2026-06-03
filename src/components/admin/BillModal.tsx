"use client";

import { useState } from "react";
import { Printer, MessageCircle, X, CheckCircle } from "lucide-react";

interface BillService {
  name: string;
  price: number;
  quantity?: number;
}

interface BillAppointment {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  staffName: string | null;
  servicesJson?: string | null;
  serviceName: string;
  servicePrice: number;
  discountCode?: string | null;
  discountAmount?: number | null;
  finalPrice?: number | null;
}

const GST_RATE = 0.05;

function formatDate(d: string) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [y, m, day] = d.split("-");
  return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`;
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2,"0")} ${ampm}`;
}

export default function BillModal({
  appointment,
  onClose,
}: {
  appointment: BillAppointment;
  onClose: () => void;
}) {
  const services: BillService[] = appointment.servicesJson
    ? JSON.parse(appointment.servicesJson)
    : [{ name: appointment.serviceName, price: appointment.servicePrice, quantity: 1 }];

  const subtotal = services.reduce((s, sv) => s + sv.price * (sv.quantity ?? 1), 0);
  const discountAmt = appointment.discountAmount ?? 0;
  const discountedSubtotal = discountAmt > 0 ? subtotal - discountAmt : subtotal;
  const gstAmount = Math.round(discountedSubtotal * GST_RATE);
  const total = discountedSubtotal + gstAmount;

  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | "card">("cash");
  const [saving, setSaving] = useState(false);
  const [billNumber, setBillNumber] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/bills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointmentId: appointment.id,
        customerName: appointment.customerName,
        customerPhone: appointment.customerPhone,
        servicesJson: appointment.servicesJson || JSON.stringify(services),
        subtotal,
        discountAmount: discountAmt,
        discountCode: appointment.discountCode,
        gstAmount,
        total,
        paymentMethod,
        date: appointment.date,
        time: appointment.time,
        staffName: appointment.staffName,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed"); }
    else { setBillNumber(data.billNumber); }
    setSaving(false);
  };

  const updatePayment = async (method: "cash" | "upi" | "card") => {
    setPaymentMethod(method);
    if (!billNumber) return;
    const rows = await fetch("/api/admin/bills").then(r => r.json());
    const bill = rows.find((b: { billNumber: string; id: string }) => b.billNumber === billNumber);
    if (bill) {
      await fetch(`/api/admin/bills/${bill.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: method }),
      });
    }
  };

  const whatsappMsg = () => {
    const serviceLines = services.map(s =>
      `• ${s.name}${(s.quantity ?? 1) > 1 ? ` ×${s.quantity}` : ""} — ₹${s.price * (s.quantity ?? 1)}`
    ).join("\n");
    const bn = billNumber ? `Bill No: ${billNumber}\n` : "";
    const discount = discountAmt > 0
      ? `\nDiscount${appointment.discountCode ? ` (${appointment.discountCode})` : ""}: -₹${discountAmt}` : "";
    return encodeURIComponent(
      `🧾 *Bill from Spin Unisex Salon*\n${bn}\nCustomer: ${appointment.customerName}\nDate: ${formatDate(appointment.date)} · ${formatTime(appointment.time)}${appointment.staffName ? `\nStylist: ${appointment.staffName}` : ""}\n\nServices:\n${serviceLines}${discount}\n\nSubtotal: ₹${subtotal}\nGST (5%): ₹${gstAmount}\n*Total: ₹${total}*\n\nPayment: ${paymentMethod.toUpperCase()} ✓\n\nThank you for visiting! 🙏\nBook again: spinkudlu.com/booking`
    );
  };

  const digits = appointment.customerPhone.replace(/\D/g, "");
  const waPhone = digits.length === 10 ? `91${digits}` : digits;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl flex flex-col max-h-[92vh]" id="bill-print-area">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 shrink-0 print:hidden">
          <h2 className="font-bold text-zinc-900">Generate Bill</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700"><X size={18} /></button>
        </div>

        {/* Bill content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* Salon header — print only */}
          <div className="hidden print:block text-center mb-4">
            <p className="text-lg font-extrabold">Spin Unisex Salon</p>
            <p className="text-xs text-zinc-500">Kudlu Gate, Bengaluru · +91 91643 63131</p>
            <p className="text-xs text-zinc-400 mt-0.5">spinkudlu.com</p>
          </div>

          {/* Bill number */}
          {billNumber && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5">
              <CheckCircle size={16} className="text-green-600 shrink-0" />
              <div>
                <p className="text-xs text-green-600 font-semibold">Bill Generated</p>
                <p className="text-sm font-bold text-green-800">{billNumber}</p>
              </div>
            </div>
          )}

          {/* Customer + date */}
          <div className="rounded-xl bg-zinc-50 px-4 py-3 space-y-1">
            <p className="text-sm font-bold text-zinc-900">{appointment.customerName}</p>
            <p className="text-xs text-zinc-500">{appointment.customerPhone}</p>
            <p className="text-xs text-zinc-400">{formatDate(appointment.date)} · {formatTime(appointment.time)}{appointment.staffName ? ` · ${appointment.staffName}` : ""}</p>
          </div>

          {/* Services */}
          <div className="rounded-xl border border-zinc-100 overflow-hidden">
            {services.map((s, i) => (
              <div key={i} className="flex justify-between items-center px-4 py-2.5 border-b border-zinc-50 last:border-0 text-sm">
                <span className="text-zinc-700">{s.name}{(s.quantity ?? 1) > 1 ? ` ×${s.quantity}` : ""}</span>
                <span className="font-medium text-zinc-800">₹{s.price * (s.quantity ?? 1)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="rounded-xl border border-zinc-200 overflow-hidden text-sm">
            <div className="flex justify-between px-4 py-2 border-b border-zinc-100">
              <span className="text-zinc-500">Subtotal</span>
              <span className="text-zinc-800">₹{subtotal}</span>
            </div>
            {discountAmt > 0 && (
              <div className="flex justify-between px-4 py-2 border-b border-zinc-100">
                <span className="text-green-600">Discount{appointment.discountCode ? ` (${appointment.discountCode})` : ""}</span>
                <span className="text-green-600">−₹{discountAmt}</span>
              </div>
            )}
            <div className="flex justify-between px-4 py-2 border-b border-zinc-100">
              <span className="text-zinc-500">GST (5%)</span>
              <span className="text-zinc-800">₹{gstAmount}</span>
            </div>
            <div className="flex justify-between px-4 py-3 bg-zinc-900">
              <span className="font-bold text-white">Total</span>
              <span className="font-bold text-white text-base">₹{total}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="print:hidden">
            <p className="mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {(["cash", "upi", "card"] as const).map(m => (
                <button key={m} onClick={() => updatePayment(m)}
                  className={`rounded-xl border py-2.5 text-sm font-semibold capitalize transition ${
                    paymentMethod === m
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                  }`}>
                  {m === "upi" ? "UPI" : m === "card" ? "Card" : "Cash"}
                </button>
              ))}
            </div>
          </div>

          {/* Print payment */}
          <div className="hidden print:flex justify-between text-sm px-1">
            <span className="text-zinc-500">Payment</span>
            <span className="font-semibold capitalize">{paymentMethod} ✓</span>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Actions */}
        <div className="border-t border-zinc-100 px-5 py-4 shrink-0 print:hidden space-y-2">
          {!billNumber ? (
            <button onClick={handleGenerate} disabled={saving}
              className="w-full rounded-full bg-zinc-900 py-3 text-sm font-bold text-white hover:bg-zinc-700 disabled:opacity-50 transition">
              {saving ? "Saving…" : "Generate Bill"}
            </button>
          ) : (
            <div className="flex gap-2">
              <a href={`https://wa.me/${waPhone}?text=${whatsappMsg()}`}
                target="_blank" rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition">
                <MessageCircle size={15} /> WhatsApp
              </a>
              <button onClick={() => window.print()}
                className="flex items-center justify-center gap-2 rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition">
                <Printer size={15} /> Print
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

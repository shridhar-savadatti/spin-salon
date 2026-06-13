"use client";

import { useEffect, useState, use } from "react";
import AdminNav from "@/components/admin/AdminNav";
import { ArrowLeft, Printer, MessageCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface BillDetail {
  id: string;
  billNumber: string;
  customerName: string;
  customerPhone: string | null;
  servicesJson: string;
  subtotal: number;
  discountAmount: number;
  discountCode: string | null;
  gstAmount: number;
  total: number;
  walletAmount: number;
  walletTransactionId: string | null;
  walletBalanceAfter: number | null;
  walletBonusBalanceAfter: number | null;
  paymentMethod: string;
  paid: boolean;
  notes: string | null;
  date: string;
  time: string;
  staffName: string | null;
}

function formatDate(d: string) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [y, m, day] = d.split("-");
  return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`;
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2,"0")} ${ampm}`;
}

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [bill, setBill] = useState<BillDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/bills/${id}`).then(r => r.ok ? r.json() : null).then(data => {
      setBill(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <AdminNav />
        <main className="flex-1 flex items-center justify-center text-zinc-400">Loading…</main>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="flex min-h-screen">
        <AdminNav />
        <main className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-3">
          <p>Invoice not found</p>
          <Link href="/admin/billing" className="text-sm text-zinc-600 underline">← Back to Billing</Link>
        </main>
      </div>
    );
  }

  const services: { name: string; price: number; quantity?: number }[] = JSON.parse(bill.servicesJson);
  const cgst = Math.round(bill.gstAmount / 2);
  const sgst = bill.gstAmount - cgst;
  const waPhone = bill.customerPhone ? (bill.customerPhone.replace(/\D/g, "").length === 10 ? `91${bill.customerPhone.replace(/\D/g, "")}` : bill.customerPhone.replace(/\D/g, "")) : "";
  const remainingAmount = bill.total - bill.walletAmount;
  const paymentLine = bill.walletAmount > 0
    ? remainingAmount > 0
      ? `Payment: ₹${bill.walletAmount} Wallet + ₹${remainingAmount} ${bill.paymentMethod.toUpperCase()} ✓`
      : `Payment: Wallet ✓`
    : `Payment: ${bill.paymentMethod.toUpperCase()} ✓`;
  const walletLine = bill.walletAmount > 0 && bill.walletBalanceAfter !== null
    ? `\n\nWallet Balance: ₹${bill.walletBalanceAfter}${bill.walletBonusBalanceAfter ? ` (+₹${bill.walletBonusBalanceAfter} bonus)` : ""}`
    : "";
  const waMsg = encodeURIComponent(
    `🧾 *Invoice from Spin Unisex Salon*\nBill No: ${bill.billNumber}\n\nCustomer: ${bill.customerName}\nDate: ${formatDate(bill.date)} · ${formatTime(bill.time)}\n\nServices:\n${services.map(s => `• ${s.name}${(s.quantity ?? 1) > 1 ? ` ×${s.quantity}` : ""} — ₹${s.price * (s.quantity ?? 1)}`).join("\n")}\n\nSubtotal: ₹${bill.subtotal}\nCGST (2.5%): ₹${cgst}\nSGST (2.5%): ₹${sgst}\n*Total: ₹${bill.total}*\n\n${paymentLine}${walletLine}\n\nThank you for visiting! 🙏\nspinkudlu.com/booking`
  );

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">

          {/* Back */}
          <Link href="/admin/billing"
            className="inline-flex items-center gap-2 mb-5 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 transition print:hidden">
            <ArrowLeft className="h-4 w-4" /> Back to Billing
          </Link>

          {/* Action bar */}
          <div className="mb-4 flex items-center gap-2 flex-wrap rounded-xl border border-zinc-200 bg-white p-3 shadow-sm print:hidden">
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition">
              <Printer className="h-3.5 w-3.5" /> Print / PDF
            </button>
            <a href={`https://wa.me/${waPhone}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
            <span className="ml-auto rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              {bill.walletAmount > 0 ? (remainingAmount === 0 ? "PAID · WALLET" : "PAID · WALLET + " + bill.paymentMethod.toUpperCase()) : "PAID"}
            </span>
          </div>

          {/* Invoice card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm print:shadow-none print:border-none" id="invoice-print">

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">S</span>
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900">Spin Unisex Salon</h2>
                </div>
                <p className="text-xs text-zinc-500">Kudlu Main Road, Kudlu Gate, Bengaluru – 560068</p>
                <p className="text-xs text-zinc-500">+91 91643 63131</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-zinc-900">INVOICE</p>
                <p className="text-sm font-mono font-semibold text-zinc-700 mt-1">{bill.billNumber}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{formatDate(bill.date)} · {formatTime(bill.time)}</p>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-6 rounded-lg bg-zinc-50 border border-zinc-200 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Bill To</p>
              <p className="font-semibold text-zinc-800">{bill.customerName}</p>
              {bill.customerPhone && <p className="text-sm text-zinc-500">{bill.customerPhone}</p>}
              {bill.staffName && <p className="text-xs text-zinc-400 mt-0.5">Stylist: {bill.staffName}</p>}
            </div>

            {/* Items table */}
            <table className="w-full mb-6 text-sm">
              <thead>
                <tr className="border-b-2 border-zinc-900">
                  <th className="pb-2 text-left font-semibold text-zinc-900">Service</th>
                  <th className="pb-2 px-2 text-center font-semibold text-zinc-900">Qty</th>
                  <th className="pb-2 px-2 text-right font-semibold text-zinc-900">Rate</th>
                  <th className="pb-2 px-2 text-right font-semibold text-zinc-900">GST</th>
                  <th className="pb-2 text-right font-semibold text-zinc-900">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {services.map((s, i) => (
                  <tr key={i}>
                    <td className="py-2.5 font-medium text-zinc-800">{s.name}</td>
                    <td className="py-2.5 px-2 text-center text-zinc-600">{s.quantity ?? 1}</td>
                    <td className="py-2.5 px-2 text-right tabular-nums text-zinc-700">₹{s.price}</td>
                    <td className="py-2.5 px-2 text-right tabular-nums text-zinc-500">5%</td>
                    <td className="py-2.5 text-right tabular-nums font-bold text-zinc-900">₹{s.price * (s.quantity ?? 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-64 space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums text-zinc-900">₹{bill.subtotal}</span>
                </div>
                {bill.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount{bill.discountCode ? ` (${bill.discountCode})` : ""}</span>
                    <span className="tabular-nums">−₹{bill.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>CGST (2.5%)</span>
                  <span className="tabular-nums text-zinc-900">₹{cgst}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>SGST (2.5%)</span>
                  <span className="tabular-nums text-zinc-900">₹{sgst}</span>
                </div>
                <div className="flex justify-between border-t-2 border-zinc-900 pt-2.5 font-bold text-base text-zinc-900">
                  <span>Total</span>
                  <span className="tabular-nums">₹{bill.total}</span>
                </div>
                {bill.walletAmount > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Paid via Wallet</span>
                      <span className="tabular-nums">−₹{bill.walletAmount}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-200 pt-1.5 font-semibold text-zinc-900">
                      <span>{remainingAmount === 0 ? "Balance" : `Paid via ${bill.paymentMethod.toUpperCase()}`}</span>
                      <span className="tabular-nums">₹{remainingAmount}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment */}
            <div className="mb-4 rounded-lg bg-green-50 border border-green-100 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                <p className="text-xs font-semibold text-green-700">Payment Received</p>
              </div>
              <p className="text-xs text-green-600">
                {bill.walletAmount > 0
                  ? remainingAmount > 0
                    ? `₹${bill.walletAmount} via Wallet + ₹${remainingAmount} via ${bill.paymentMethod.toUpperCase()} · ${formatDate(bill.date)}`
                    : `₹${bill.total} via Wallet · ${formatDate(bill.date)}`
                  : `₹${bill.total} via ${bill.paymentMethod.toUpperCase()} · ${formatDate(bill.date)}`}
              </p>
              {bill.walletAmount > 0 && bill.walletBalanceAfter !== null && (
                <p className="text-xs text-green-600 mt-0.5">
                  Wallet balance after: ₹{bill.walletBalanceAfter}
                  {bill.walletBonusBalanceAfter ? ` (+₹${bill.walletBonusBalanceAfter} bonus)` : ""}
                </p>
              )}
            </div>

            {/* Notes */}
            {bill.notes && (
              <p className="text-xs text-zinc-400 text-center border-t border-zinc-100 pt-4 italic">
                Note: {bill.notes}
              </p>
            )}

            {/* Footer */}
            <p className="mt-4 text-center text-xs text-zinc-400 border-t border-zinc-100 pt-4">
              Thank you for visiting Spin Unisex Salon! · spinkudlu.com
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

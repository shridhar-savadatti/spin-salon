"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import Button from "@/components/ui/Button";
import { ArrowLeft, Send, CheckCircle2, ExternalLink, Users, TrendingUp, Download } from "lucide-react";
import Link from "next/link";
import { Campaign, CampaignCustomer } from "@/types";
import { formatDate } from "@/lib/utils";

export default function CampaignRunnerPage() {
  const params = useParams();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [customers, setCustomers] = useState<CampaignCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentSet, setSentSet] = useState<Set<number>>(new Set());
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/campaigns/${id}`).then(r => r.json()),
    ]).then(([camp]) => {
      setCampaign(camp);
      // Fetch customers with campaign's filters
      const params = new URLSearchParams({
        service: camp.serviceFilter || "all",
        weeks: camp.weeksSinceVisit?.toString() || "0",
        message: camp.messageTemplate,
      });
      return fetch(`/api/admin/campaign-customers?${params}`).then(r => r.json());
    }).then(data => {
      setCustomers(data.customers || []);
      setLoading(false);
    });
  }, [id]);

  const markSent = (index: number) => {
    setSentSet(prev => new Set([...prev, index]));
    setCurrentIndex(index + 1);
    setLaunched(true);
    fetch(`/api/admin/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentCount: sentSet.size + 1 }),
    });
  };

  const markComplete = async () => {
    await fetch(`/api/admin/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentCount: sentSet.size, status: "sent" }),
    });
    setCampaign(prev => prev ? { ...prev, status: "sent", sentCount: sentSet.size } : null);
  };

  const exportCSV = () => {
    const rows = ["Name,Phone,Service,Last Visit,Message"];
    customers.forEach(c => {
      rows.push(`"${c.name}","${c.phone}","${c.serviceName}","${c.lastVisit}","${c.message.replace(/"/g, '""')}"`);
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-${campaign?.name || id}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-zinc-50">
        <AdminNav />
        <div className="flex-1 flex items-center justify-center text-zinc-400">Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) return null;

  const progress = customers.length > 0 ? Math.round((sentSet.size / customers.length) * 100) : 0;
  const currentCustomer = customers[currentIndex];
  const isDone = currentIndex >= customers.length;
  const isSent = campaign.status === "sent";

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="flex-1 p-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin/campaigns" className="text-zinc-400 hover:text-zinc-700 transition">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-zinc-900">{campaign.name}</h1>
            <p className="text-sm text-zinc-500">{customers.length} customers · {campaign.serviceFilter || "All services"}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isSent ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-600"}`}>
            {isSent ? "Completed" : "Ready to Send"}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Queue */}
          <div className="lg:col-span-2 space-y-5">

            {/* Progress bar */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold text-zinc-900">Campaign Progress</h3>
                <span className="text-sm font-bold text-zinc-900">{sentSet.size} / {customers.length} sent</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-zinc-900 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-zinc-400">{progress}% complete</p>
            </div>

            {/* Current customer + send button */}
            {!isSent && (
              <div className="rounded-2xl border-2 border-zinc-900 bg-zinc-900 p-6 shadow-lg">
                {isDone ? (
                  <div className="text-center">
                    <CheckCircle2 size={48} className="mx-auto mb-3 text-green-400" />
                    <h3 className="text-xl font-extrabold text-white">All Done!</h3>
                    <p className="mt-1 text-zinc-400">You sent messages to {sentSet.size} customers.</p>
                    <Button variant="light" className="mt-4" onClick={markComplete}>
                      Mark Campaign as Complete
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Next: Customer {currentIndex + 1} of {customers.length}
                      </p>
                      {launched && <span className="text-xs text-green-400">✓ WhatsApp opened</span>}
                    </div>

                    <div className="mb-5">
                      <p className="text-lg font-bold text-white">{currentCustomer?.name}</p>
                      <p className="text-sm text-zinc-400">{currentCustomer?.phone} · Last: {currentCustomer?.serviceName}</p>
                    </div>

                    {/* Preview of message */}
                    <div className="mb-5 rounded-xl bg-white/10 p-4 text-sm text-zinc-200 leading-relaxed">
                      {currentCustomer?.message}
                    </div>

                    {/* Native <a> tag — works on mobile without popup blocker */}
                    <a
                      href={currentCustomer?.waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => markSent(currentIndex)}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-lg font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-100 active:scale-95"
                    >
                      <Send size={16} />
                      Open WhatsApp & Send
                      <ExternalLink size={14} />
                    </a>
                    <p className="mt-2 text-center text-xs text-zinc-500">
                      Opens WhatsApp with message pre-filled — just tap Send
                    </p>
                  </>
                )}
              </div>
            )}

            {isSent && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
                <CheckCircle2 size={40} className="mx-auto mb-3 text-green-600" />
                <h3 className="text-lg font-extrabold text-zinc-900">Campaign Sent!</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {campaign.sentCount} messages sent on {campaign.sentAt ? formatDate(campaign.sentAt) : ""}
                </p>
              </div>
            )}

            {/* Customer list */}
            <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-zinc-100 px-5 py-3 flex items-center justify-between">
                <h3 className="font-bold text-zinc-900">Customer List</h3>
                <button onClick={exportCSV}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 transition">
                  <Download size={13} /> Export CSV
                </button>
              </div>
              <div className="divide-y divide-zinc-50 max-h-96 overflow-y-auto">
                {customers.map((c, i) => (
                  <div key={i} className={`flex items-center gap-4 px-5 py-3 text-sm transition ${i === currentIndex && !isSent ? "bg-zinc-50" : ""}`}>
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${sentSet.has(i) ? "bg-green-100 text-green-700" : i === currentIndex ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"}`}>
                      {sentSet.has(i) ? "✓" : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-900 truncate">{c.name}</p>
                      <p className="text-xs text-zinc-400">{c.phone} · {c.serviceName}</p>
                    </div>
                    <a href={c.waLink} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-zinc-900">Campaign Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total customers</span>
                  <span className="font-semibold">{customers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Messages sent</span>
                  <span className="font-semibold">{sentSet.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Remaining</span>
                  <span className="font-semibold">{customers.length - sentSet.size}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 pt-3">
                  <span className="text-zinc-500">Est. cost (Meta API)</span>
                  <span className="font-semibold">₹{Math.round(customers.length * 0.73)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-900 p-6 shadow-sm text-white">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-green-400" />
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Estimated Returns</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Expected bookings</span>
                  <span className="font-bold">{Math.round(customers.length * 0.2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Revenue (₹750 avg)</span>
                  <span className="font-bold text-green-400">₹{(Math.round(customers.length * 0.2) * 750).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-bold text-zinc-900">How to Send</h3>
              <ol className="space-y-2 text-sm text-zinc-600">
                <li className="flex gap-2"><span className="font-bold text-zinc-900 shrink-0">1.</span>Click "Open WhatsApp & Send"</li>
                <li className="flex gap-2"><span className="font-bold text-zinc-900 shrink-0">2.</span>WhatsApp opens with message pre-filled</li>
                <li className="flex gap-2"><span className="font-bold text-zinc-900 shrink-0">3.</span>Just tap the Send button</li>
                <li className="flex gap-2"><span className="font-bold text-zinc-900 shrink-0">4.</span>Come back and click next</li>
              </ol>
              <p className="mt-3 text-xs text-zinc-400">Takes ~5 seconds per customer. 50 customers = ~4 minutes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

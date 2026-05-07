"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import Button from "@/components/ui/Button";
import { ArrowLeft, Send, CheckCircle2, ExternalLink, Download, Zap, MessageSquare, AlertCircle, Loader } from "lucide-react";
import Link from "next/link";
import { Campaign, CampaignCustomer } from "@/types";

type SendMethod = "free" | "meta";

export default function CampaignRunnerPage() {
  const params = useParams();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [customers, setCustomers] = useState<CampaignCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<SendMethod>("free");
  const [sent, setSent] = useState<Set<string>>(new Set());

  // Meta API state
  const [metaSending, setMetaSending] = useState(false);
  const [metaResult, setMetaResult] = useState<{ sent: number; failed: number; estimatedCost: string; results: { name: string; phone: string; status: string; error?: string }[] } | null>(null);
  const [metaError, setMetaError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/campaigns/${id}`)
      .then(r => r.json())
      .then(camp => {
        setCampaign(camp);
        const p = new URLSearchParams({
          service: camp.serviceFilter || "all",
          weeks: camp.weeksSinceVisit?.toString() || "0",
          message: camp.messageTemplate,
        });
        return fetch(`/api/admin/campaign-customers?${p}`).then(r => r.json());
      })
      .then(data => { setCustomers(data.customers || []); setLoading(false); });
  }, [id]);

  const markSent = (phone: string) => {
    setSent(prev => {
      const next = new Set(prev);
      next.add(phone);
      fetch(`/api/admin/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentCount: next.size }),
      });
      return next;
    });
  };

  const sendViaMetaApi = async () => {
    setMetaSending(true);
    setMetaError("");
    setMetaResult(null);
    try {
      const res = await fetch("/api/admin/send-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMetaError(data.error || "Failed to send");
      } else {
        setMetaResult(data);
        // Mark all as sent
        await fetch(`/api/admin/campaigns/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sentCount: data.sent, status: "sent" }),
        });
        setCampaign(prev => prev ? { ...prev, status: "sent", sentCount: data.sent } : null);
      }
    } catch {
      setMetaError("Network error. Check your connection.");
    } finally {
      setMetaSending(false);
    }
  };

  const markComplete = async () => {
    await fetch(`/api/admin/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentCount: sent.size, status: "sent" }),
    });
    setCampaign(prev => prev ? { ...prev, status: "sent", sentCount: sent.size } : null);
  };

  const exportCSV = () => {
    const rows = ["Name,Phone,Service,Last Visit,Message"];
    customers.forEach(c => {
      rows.push(`"${c.name}","${c.phone}","${c.serviceName}","${c.lastVisit}","${c.message.replace(/"/g, '""')}"`);
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `campaign-${campaign?.name || id}.csv`;
    a.click();
  };

  if (loading) return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="flex-1 flex items-center justify-center text-zinc-400">Loading...</div>
    </div>
  );

  if (!campaign) return null;

  const isSent = campaign.status === "sent";
  const remaining = customers.filter(c => !sent.has(c.phone));

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="flex-1 p-4 md:p-8">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin/campaigns" className="text-zinc-400 hover:text-zinc-700 transition">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-zinc-900">{campaign.name}</h1>
            <p className="text-sm text-zinc-500">{customers.length} customers · {campaign.serviceFilter || "All services"}</p>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition">
            <Download size={13} /> CSV
          </button>
        </div>

        {isSent && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
            <CheckCircle2 size={32} className="mx-auto mb-2 text-green-600" />
            <p className="font-bold text-zinc-900">Campaign Complete!</p>
            <p className="text-sm text-zinc-500">{campaign.sentCount} messages sent</p>
          </div>
        )}

        {/* Send Method Toggle */}
        {!isSent && (
          <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold text-zinc-900">Choose Send Method</h3>
            <div className="grid gap-3 sm:grid-cols-2">

              {/* Free Option */}
              <button onClick={() => setMethod("free")}
                className={`rounded-xl border-2 p-4 text-left transition-all ${method === "free" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white hover:border-zinc-400"}`}>
                <div className="mb-2 flex items-center gap-2">
                  <MessageSquare size={18} className={method === "free" ? "text-white" : "text-zinc-600"} />
                  <span className="font-bold">Free — Manual</span>
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${method === "free" ? "bg-white text-zinc-900" : "bg-green-100 text-green-700"}`}>₹0</span>
                </div>
                <p className={`text-xs ${method === "free" ? "text-zinc-300" : "text-zinc-500"}`}>
                  Opens WhatsApp for each customer. You tap Send manually. ~5 sec per customer.
                </p>
              </button>

              {/* Meta API Option */}
              <button onClick={() => setMethod("meta")}
                className={`rounded-xl border-2 p-4 text-left transition-all ${method === "meta" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white hover:border-zinc-400"}`}>
                <div className="mb-2 flex items-center gap-2">
                  <Zap size={18} className={method === "meta" ? "text-white" : "text-zinc-600"} />
                  <span className="font-bold">Meta API — Auto</span>
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${method === "meta" ? "bg-white text-zinc-900" : "bg-blue-100 text-blue-700"}`}>₹0.73/msg</span>
                </div>
                <p className={`text-xs ${method === "meta" ? "text-zinc-300" : "text-zinc-500"}`}>
                  Sends to all {customers.length} customers instantly. Est. cost: ₹{(customers.length * 0.73).toFixed(0)}. Needs Meta API setup.
                </p>
              </button>

            </div>
          </div>
        )}

        {/* FREE METHOD */}
        {method === "free" && !isSent && (
          <>
            {/* Progress */}
            <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-bold text-zinc-900">Progress</span>
                <span className="text-sm font-bold text-zinc-900">{sent.size} / {customers.length}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full rounded-full bg-zinc-900 transition-all duration-500"
                  style={{ width: `${customers.length > 0 ? (sent.size / customers.length) * 100 : 0}%` }} />
              </div>
              {sent.size > 0 && sent.size === customers.length && (
                <Button className="mt-4 w-full" onClick={markComplete}>
                  <CheckCircle2 size={15} /> Mark Campaign Complete
                </Button>
              )}
            </div>

            <div className="mb-4 rounded-xl bg-zinc-900 px-4 py-3 text-xs text-zinc-300">
              <strong className="text-white">How to send:</strong> Tap "Send on WhatsApp" → message opens pre-filled → tap Send → come back → next customer
            </div>

            {/* Pending */}
            {remaining.length > 0 && (
              <div className="mb-5">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">Pending ({remaining.length})</h3>
                <div className="space-y-3">
                  {remaining.map(c => (
                    <div key={c.phone} className="rounded-2xl border-2 border-zinc-900 bg-zinc-900 p-4">
                      <div className="mb-2">
                        <p className="font-bold text-white">{c.name}</p>
                        <p className="text-xs text-zinc-400">{c.phone} · {c.serviceName}</p>
                      </div>
                      <p className="mb-3 rounded-xl bg-white/10 px-3 py-2 text-xs leading-relaxed text-zinc-200">{c.message}</p>
                      <a href={c.waLink} target="_blank" rel="noopener noreferrer"
                        onClick={() => markSent(c.phone)}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-zinc-900 transition hover:bg-zinc-100 active:scale-95">
                        <Send size={15} /> Send on WhatsApp <ExternalLink size={13} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sent */}
            {sent.size > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">Sent ({sent.size})</h3>
                <div className="space-y-2">
                  {customers.filter(c => sent.has(c.phone)).map(c => (
                    <div key={c.phone} className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3">
                      <CheckCircle2 size={16} className="shrink-0 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-zinc-900">{c.name}</p>
                        <p className="text-xs text-zinc-400">{c.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* META API METHOD */}
        {method === "meta" && !isSent && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="mb-1 font-bold text-zinc-900">Send via Meta WhatsApp API</h3>
              <p className="mb-5 text-sm text-zinc-500">
                Sends to all {customers.length} customers automatically in one click.
              </p>

              <div className="mb-5 rounded-xl bg-zinc-50 p-4 text-sm">
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-500">Customers</span>
                  <span className="font-semibold">{customers.length}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-500">Rate (marketing)</span>
                  <span className="font-semibold">₹0.73 / message</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">Estimated cost</span>
                  <span className="font-bold text-zinc-900">₹{(customers.length * 0.73).toFixed(2)}</span>
                </div>
              </div>

              {metaError && (
                <div className="mb-4 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Error</p>
                    <p className="mt-0.5">{metaError}</p>
                    {metaError.includes("not configured") && (
                      <p className="mt-2 text-xs">Go to Vercel → Settings → Environment Variables → Add <strong>WHATSAPP_PHONE_NUMBER_ID</strong> and <strong>WHATSAPP_ACCESS_TOKEN</strong></p>
                    )}
                  </div>
                </div>
              )}

              {metaResult ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={18} className="text-green-600" />
                    <span className="font-bold text-zinc-900">Campaign Sent!</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-zinc-500">Sent</span><span className="font-semibold text-green-700">{metaResult.sent}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Failed</span><span className="font-semibold text-red-600">{metaResult.failed}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Cost</span><span className="font-semibold">{metaResult.estimatedCost}</span></div>
                  </div>
                  {metaResult.results.filter(r => r.status === "failed").length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-red-600 mb-1">Failed numbers:</p>
                      {metaResult.results.filter(r => r.status === "failed").map((r, i) => (
                        <p key={i} className="text-xs text-zinc-500">{r.name} ({r.phone}): {r.error}</p>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Button className="w-full gap-2" onClick={sendViaMetaApi} loading={metaSending}
                  disabled={metaSending}>
                  {metaSending ? (
                    <><Loader size={15} className="animate-spin" /> Sending to {customers.length} customers...</>
                  ) : (
                    <><Zap size={15} /> Send to All {customers.length} Customers Now</>
                  )}
                </Button>
              )}
            </div>

            {/* Customer preview */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-bold text-zinc-900">Message Preview</h3>
              {customers[0] && (
                <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-700 leading-relaxed">
                  {customers[0].message}
                </div>
              )}
              <p className="mt-2 text-xs text-zinc-400">Same message personalised for each customer with their name and service.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

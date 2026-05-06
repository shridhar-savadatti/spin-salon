"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import Button from "@/components/ui/Button";
import { ArrowLeft, Send, CheckCircle2, ExternalLink, Download } from "lucide-react";
import Link from "next/link";
import { Campaign, CampaignCustomer } from "@/types";

export default function CampaignRunnerPage() {
  const params = useParams();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [customers, setCustomers] = useState<CampaignCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  // Track sent per customer using phone as key — persists across re-renders
  const [sent, setSent] = useState<Set<string>>(new Set());

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
      .then(data => {
        setCustomers(data.customers || []);
        setLoading(false);
      });
  }, [id]);

  const markSent = (phone: string) => {
    setSent(prev => {
      const next = new Set(prev);
      next.add(phone);
      // Auto-save progress
      fetch(`/api/admin/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentCount: next.size }),
      });
      return next;
    });
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

  const isSent = campaign.status === "sent";
  const remaining = customers.filter(c => !sent.has(c.phone));
  const sentList = customers.filter(c => sent.has(c.phone));

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

        {/* Progress */}
        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-bold text-zinc-900">Progress</span>
            <span className="text-sm font-bold text-zinc-900">{sent.size} / {customers.length} sent</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full rounded-full bg-zinc-900 transition-all duration-500"
              style={{ width: `${customers.length > 0 ? (sent.size / customers.length) * 100 : 0}%` }} />
          </div>
          {sent.size > 0 && sent.size === customers.length && !isSent && (
            <Button variant="primary" className="mt-4 w-full" onClick={markComplete}>
              <CheckCircle2 size={15} /> Mark Campaign Complete
            </Button>
          )}
        </div>

        {isSent && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
            <CheckCircle2 size={32} className="mx-auto mb-2 text-green-600" />
            <p className="font-bold text-zinc-900">Campaign Complete!</p>
            <p className="text-sm text-zinc-500">{campaign.sentCount} messages sent</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mb-5 rounded-xl bg-zinc-900 px-4 py-3 text-xs text-zinc-300">
          <strong className="text-white">How to send:</strong> Tap "Send on WhatsApp" → message opens pre-filled → tap Send in WhatsApp → come back here → tap next customer
        </div>

        {/* Remaining customers */}
        {remaining.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">Pending ({remaining.length})</h3>
            <div className="space-y-3">
              {remaining.map(c => (
                <div key={c.phone} className="rounded-2xl border-2 border-zinc-900 bg-zinc-900 p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">{c.name}</p>
                      <p className="text-xs text-zinc-400">{c.phone} · Last: {c.serviceName}</p>
                    </div>
                  </div>
                  <p className="mb-3 rounded-xl bg-white/10 px-3 py-2 text-xs leading-relaxed text-zinc-200">{c.message}</p>
                  <a
                    href={c.waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => markSent(c.phone)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-zinc-900 transition hover:bg-zinc-100 active:scale-95"
                  >
                    <Send size={15} /> Send on WhatsApp <ExternalLink size={13} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sent customers */}
        {sentList.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">Sent ({sentList.length})</h3>
            <div className="space-y-2">
              {sentList.map(c => (
                <div key={c.phone} className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3">
                  <CheckCircle2 size={16} className="shrink-0 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-zinc-900">{c.name}</p>
                    <p className="text-xs text-zinc-400">{c.phone}</p>
                  </div>
                  <a href={c.waLink} target="_blank" rel="noopener noreferrer"
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 transition">
                    <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

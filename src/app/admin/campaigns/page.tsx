"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { Campaign } from "@/types";
import { PlusCircle, Send, Trash2, RefreshCw, Users, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/campaigns", { cache: "no-store" });
    if (res.ok) setCampaigns(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const deleteCampaign = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    setDeleting(id);
    await fetch(`/api/admin/campaigns/${id}`, { method: "DELETE" });
    await fetchCampaigns();
    setDeleting(null);
  };

  const totalSent = campaigns.reduce((a, c) => a + c.sentCount, 0);
  const totalCustomers = campaigns.reduce((a, c) => a + c.totalCustomers, 0);

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900">Campaigns</h1>
            <p className="mt-0.5 text-sm text-zinc-500">Send WhatsApp offers to filtered customers</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={fetchCampaigns} className="gap-2">
              <RefreshCw size={14} /> Refresh
            </Button>
            <Link href="/admin/campaigns/new">
              <Button size="sm" className="gap-2"><PlusCircle size={15} /> New Campaign</Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: "Total Campaigns", value: campaigns.length, icon: Send },
            { label: "Total Customers Reached", value: totalSent.toLocaleString(), icon: Users },
            { label: "Campaigns Sent", value: campaigns.filter(c => c.status === "sent").length, icon: CheckCircle2 },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900">
                <stat.icon size={18} className="text-white" />
              </div>
              <p className="text-2xl font-extrabold text-zinc-900">{stat.value}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-zinc-400">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 py-20 text-center">
            <Send size={32} className="mx-auto mb-4 text-zinc-300" />
            <p className="mb-2 font-semibold text-zinc-600">No campaigns yet</p>
            <p className="mb-6 text-sm text-zinc-400">Create your first campaign to start reaching customers on WhatsApp</p>
            <Link href="/admin/campaigns/new">
              <Button className="gap-2"><PlusCircle size={15} /> Create First Campaign</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map(c => (
              <div key={c.id} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-zinc-900">{c.name}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.status === "sent" ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                        {c.status === "sent" ? "Sent" : "Draft"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-zinc-500 line-clamp-1">{c.messageTemplate}</p>

                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Users size={11} />
                        {c.totalCustomers} customers targeted
                      </span>
                      {c.status === "sent" && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 size={11} />
                          {c.sentCount} sent · {c.sentAt ? formatDate(c.sentAt) : ""}
                        </span>
                      )}
                      {c.serviceFilter && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">
                          Filter: {c.serviceFilter}
                        </span>
                      )}
                      {c.weeksSinceVisit > 0 && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">
                          No visit in {c.weeksSinceVisit}+ weeks
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Link href={`/admin/campaigns/${c.id}`}>
                      <Button size="sm" className="gap-1.5">
                        <Send size={13} />
                        {c.status === "sent" ? "View" : "Launch"}
                      </Button>
                    </Link>
                    <button
                      onClick={() => deleteCampaign(c.id)}
                      disabled={deleting === c.id}
                      className="rounded-xl border border-zinc-200 p-2 text-zinc-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

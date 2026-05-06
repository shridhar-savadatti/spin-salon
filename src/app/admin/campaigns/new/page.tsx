"use client";

import { useState, useEffect, useCallback } from "react";
import AdminNav from "@/components/admin/AdminNav";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ArrowLeft, Users, Eye, Sparkles } from "lucide-react";
import Link from "next/link";
import { SERVICE_CATEGORIES } from "@/lib/services-data";
import { CampaignCustomer } from "@/types";

const TEMPLATES = [
  {
    label: "Win-back offer",
    text: "Hi {name}! 👋 We miss you at Spin Unisex Salon. It's been a while since your last {service}. Book this week and get 15% off. Call us: 0120-524-4768",
  },
  {
    label: "Festival offer",
    text: "Hi {name}! 🎉 Special offer at Spin Unisex Salon this week. Get 20% off on all hair services. Limited slots — book now! 0120-524-4768",
  },
  {
    label: "New service launch",
    text: "Hi {name}! ✨ We've added exciting new services at Spin Unisex Salon. Book your appointment today and be among the first to try them! 0120-524-4768",
  },
  {
    label: "Loyalty reward",
    text: "Hi {name}! 🙏 Thank you for being a loyal customer at Spin Unisex Salon. As a token of appreciation, enjoy a FREE hair wash with your next {service} booking!",
  },
];

export default function NewCampaignPage() {
  const [name, setName] = useState("");
  const [messageTemplate, setMessageTemplate] = useState(TEMPLATES[0].text);
  const [serviceFilter, setServiceFilter] = useState("all");
  const [weeksSince, setWeeksSince] = useState(4);
  const [customers, setCustomers] = useState<CampaignCustomer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);


  const fetchCustomers = useCallback(async () => {
    setLoadingCustomers(true);
    const params = new URLSearchParams({
      service: serviceFilter,
      weeks: weeksSince.toString(),
      message: messageTemplate,
    });
    const res = await fetch(`/api/admin/campaign-customers?${params}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setCustomers(data.customers);
    }
    setLoadingCustomers(false);
  }, [serviceFilter, weeksSince, messageTemplate]);

  useEffect(() => {
    fetchCustomers();
  }, [serviceFilter, weeksSince]);

  const handleSave = async () => {
    if (!name || !messageTemplate) return;
    setSaving(true);
    const res = await fetch("/api/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, messageTemplate, serviceFilter: serviceFilter === "all" ? null : serviceFilter,
        weeksSinceVisit: weeksSince, totalCustomers: customers.length,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      window.location.href = `/admin/campaigns/${data.id}`;
    }
    setSaving(false);
  };

  const sampleMessage = customers[0]?.message || messageTemplate
    .replace("{name}", "Priya")
    .replace("{fullname}", "Priya Sharma")
    .replace("{service}", serviceFilter === "all" ? "Hair Cut" : serviceFilter)
    .replace("{salon}", "Spin Unisex Salon");

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="flex-1 p-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin/campaigns" className="text-zinc-400 hover:text-zinc-700 transition">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-extrabold text-zinc-900">New Campaign</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Config */}
          <div className="space-y-5 lg:col-span-2">

            {/* Campaign name */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <Input label="Campaign Name" id="name" value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. May Haircut Win-back" />
            </div>

            {/* Filters */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-zinc-900">Target Customers</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Filter by Service</label>
                  <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}
                    className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none">
                    <option value="all">All Services (Everyone)</option>
                    {SERVICE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                    Last visit more than
                  </label>
                  <select value={weeksSince} onChange={e => setWeeksSince(parseInt(e.target.value))}
                    className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none">
                    <option value={0}>Any time (no filter)</option>
                    <option value={2}>2 weeks ago</option>
                    <option value={4}>4 weeks ago</option>
                    <option value={6}>6 weeks ago</option>
                    <option value={8}>8 weeks ago</option>
                    <option value={12}>3 months ago</option>
                    <option value={24}>6 months ago</option>
                  </select>
                </div>
              </div>

              {/* Customer count */}
              <div className={`mt-4 flex items-center gap-3 rounded-xl p-3 ${loadingCustomers ? "bg-zinc-50" : customers.length > 0 ? "bg-green-50" : "bg-zinc-50"}`}>
                <Users size={16} className={customers.length > 0 ? "text-green-600" : "text-zinc-400"} />
                {loadingCustomers ? (
                  <span className="text-sm text-zinc-400">Counting customers...</span>
                ) : (
                  <span className={`text-sm font-semibold ${customers.length > 0 ? "text-green-700" : "text-zinc-500"}`}>
                    {customers.length} customers match this filter
                    {customers.length > 0 && ` — estimated ${Math.round(customers.length * 0.2)} bookings from campaign`}
                  </span>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-zinc-900">Message</h3>
                <span className="text-xs text-zinc-400">Variables: {"{name}"} {"{service}"} {"{salon}"}</span>
              </div>

              {/* Quick templates */}
              <div className="mb-3 flex flex-wrap gap-2">
                {TEMPLATES.map(t => (
                  <button key={t.label} onClick={() => setMessageTemplate(t.text)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${messageTemplate === t.text ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-600 hover:border-zinc-400"}`}>
                    <Sparkles size={10} className="inline mr-1" />
                    {t.label}
                  </button>
                ))}
              </div>

              <textarea value={messageTemplate} onChange={e => setMessageTemplate(e.target.value)} rows={5}
                className="w-full rounded-xl border-2 border-zinc-200 px-4 py-3 text-sm text-zinc-900 transition focus:border-zinc-900 focus:outline-none" />

              <p className="mt-1.5 text-xs text-zinc-400">
                {messageTemplate.length} characters · WhatsApp shows full message
              </p>
            </div>
          </div>

          {/* Right: Preview + Save */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-zinc-900">Actions</h3>
              <div className="space-y-3">
                <Button className="w-full" loading={saving} disabled={!name || customers.length === 0}
                  onClick={handleSave}>
                  Save & Launch Campaign
                </Button>
                <Button variant="outline" className="w-full" onClick={fetchCustomers}>
                  Refresh Customer Count
                </Button>
              </div>
              {!name && <p className="mt-2 text-xs text-red-500">Enter a campaign name to save</p>}
            </div>

            {/* Message Preview */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <button className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-900"
                onClick={() => setPreviewing(!previewing)}>
                <Eye size={14} /> Preview Message
              </button>
              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="mb-1 text-xs font-semibold text-zinc-400">Sample for first customer:</p>
                <div className="rounded-2xl rounded-tl-none bg-white p-3 shadow-sm text-sm text-zinc-800 leading-relaxed">
                  {sampleMessage}
                </div>
              </div>
            </div>

            {/* ROI estimate */}
            {customers.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-900 p-6 shadow-sm text-white">
                <h3 className="mb-3 text-sm font-bold text-zinc-300 uppercase tracking-wider">Estimated ROI</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Customers</span>
                    <span className="font-bold">{customers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Est. bookings (20%)</span>
                    <span className="font-bold">{Math.round(customers.length * 0.2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Est. revenue (₹750 avg)</span>
                    <span className="font-bold text-green-400">₹{(Math.round(customers.length * 0.2) * 750).toLocaleString()}</span>
                  </div>
                  <div className="mt-2 border-t border-zinc-700 pt-2 flex justify-between">
                    <span className="text-zinc-400">Campaign cost</span>
                    <span className="font-bold">₹{Math.round(customers.length * 0.73)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { getSql } from "@/lib/db";
import AdminNav from "@/components/admin/AdminNav";
import { BarChart2, Users, Calendar, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const sql = getSql();

  const analyticsRows = await sql`SELECT page, COUNT(*) as visits FROM analytics GROUP BY page ORDER BY visits DESC`;
  const total = analyticsRows.reduce((s, r) => s + parseInt((r as { visits: string }).visits), 0);
  const maxVisits = Math.max(...analyticsRows.map(r => parseInt((r as { visits: string }).visits)), 1);

  const apptStats = await sql`SELECT status, COUNT(*) as c FROM appointments GROUP BY status`;
  const counts = { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  (apptStats as { status: string; c: string }[]).forEach(r => {
    const n = parseInt(r.c);
    counts.total += n;
    if (r.status in counts) counts[r.status as keyof typeof counts] = n;
  });

  const revenueRows = await sql`SELECT COALESCE(SUM(service_price), 0) as total FROM appointments WHERE status = 'completed'`;
  const revenue = parseInt((revenueRows[0] as { total: string }).total) || 0;

  const recentBookings = await sql`SELECT customer_name, service_name, date, status FROM appointments ORDER BY created_at DESC LIMIT 5`;

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <div className="flex-1 p-4 md:p-8">
        <h1 className="mb-8 text-2xl font-extrabold text-zinc-900">Analytics</h1>

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Bookings", value: counts.total, icon: Calendar, color: "bg-zinc-900 text-white" },
            { label: "Completed", value: counts.completed, icon: TrendingUp, color: "bg-green-50 text-green-700" },
            { label: "Pending", value: counts.pending, icon: Users, color: "bg-yellow-50 text-yellow-700" },
            { label: "Revenue", value: `₹${revenue.toLocaleString()}`, icon: BarChart2, color: "bg-blue-50 text-blue-700" },
          ].map(stat => (
            <div key={stat.label} className={`rounded-2xl p-5 ${stat.color}`}>
              <stat.icon size={20} className="mb-2 opacity-70" />
              <p className="text-2xl font-extrabold">{stat.value}</p>
              <p className="mt-0.5 text-sm opacity-70">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-100 bg-white p-6">
            <div className="mb-6 flex items-center gap-2">
              <BarChart2 size={18} className="text-zinc-700" />
              <h2 className="font-bold text-zinc-900">Page Views</h2>
              <span className="ml-auto text-sm text-zinc-400">{total} total</span>
            </div>
            <div className="space-y-3">
              {analyticsRows.length === 0 ? (
                <p className="text-center text-zinc-400">No data yet.</p>
              ) : (analyticsRows as { page: string; visits: string }[]).map(p => (
                <div key={p.page}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium capitalize text-zinc-700">{p.page}</span>
                    <span className="text-zinc-500">{p.visits}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div className="h-full rounded-full bg-zinc-700" style={{ width: `${(parseInt(p.visits) / maxVisits) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-white p-6">
            <h2 className="mb-6 font-bold text-zinc-900">Appointment Status</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total", value: counts.total, color: "bg-zinc-100 text-zinc-800" },
                { label: "Pending", value: counts.pending, color: "bg-yellow-100 text-yellow-700" },
                { label: "Confirmed", value: counts.confirmed, color: "bg-blue-100 text-blue-700" },
                { label: "Completed", value: counts.completed, color: "bg-green-100 text-green-700" },
                { label: "Cancelled", value: counts.cancelled, color: "bg-red-100 text-red-600" },
              ].map(stat => (
                <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
                  <p className="text-3xl font-extrabold">{stat.value}</p>
                  <p className="text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-white p-6 lg:col-span-2">
            <h2 className="mb-4 font-bold text-zinc-900">Recent Bookings</h2>
            <div className="divide-y divide-zinc-50">
              {(recentBookings as { customer_name: string; service_name: string; date: string; status: string }[]).map((b, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-zinc-900">{b.customer_name}</p>
                    <p className="text-xs text-zinc-400">{b.service_name} · {b.date}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    b.status === "completed" ? "bg-green-100 text-green-700" :
                    b.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                    b.status === "cancelled" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"
                  }`}>{b.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

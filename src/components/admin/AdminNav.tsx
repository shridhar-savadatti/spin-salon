"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, Settings, BarChart2, LogOut, FileText, Megaphone, Menu, X, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type Role = "store" | "blog" | null;

const STORE_ITEMS = [
  { href: "/admin/appointments", label: "Appointments", icon: Calendar },
  { href: "/admin/slots", label: "Manage Slots", icon: Settings },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/offers", label: "Promo Offers", icon: Tag },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
];

const BLOG_ITEMS = [
  { href: "/admin/blog", label: "Blog Posts", icon: FileText },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<Role>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(data => data ? setRole(data.role) : null);
  }, []);

  // Default to store items while role is loading — blog role swaps them out
  const navItems = role === "blog" ? BLOG_ITEMS : STORE_ITEMS;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
            pathname.startsWith(item.href)
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
          )}
        >
          <item.icon size={17} />
          {item.label}
        </Link>
      ))}
    </>
  );

  return (
    <>
      {/* ── Mobile top bar ───────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-zinc-900">
            <Image src="/images/spin-logo.png" alt="Spin" fill className="object-contain p-0.5" />
          </div>
          <span className="font-bold text-zinc-900 text-sm">
            Spin <span className="text-zinc-500">Admin</span>
          </span>
          {role && (
            <span className={cn("rounded px-1.5 py-0.5 text-xs font-medium",
              role === "blog" ? "bg-blue-100 text-blue-600" : "bg-zinc-100 text-zinc-500")}>
              {role === "blog" ? "Blog" : "Store"}
            </span>
          )}
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-white shadow-xl pt-16">
            <nav className="space-y-1 p-4">
              <NavLinks />
            </nav>
            <div className="border-t border-zinc-100 p-4">
              <button onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 transition hover:bg-red-50 hover:text-red-500">
                <LogOut size={17} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ───────────────────────────────── */}
      <aside className="hidden md:flex min-h-screen w-64 flex-col border-r border-zinc-200 bg-white">
        <div className="flex items-center gap-2 border-b border-zinc-100 p-6">
          <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-zinc-900">
            <Image src="/images/spin-logo.png" alt="Spin" fill className="object-contain p-0.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-zinc-900">
              Spin <span className="text-zinc-500">Unisex</span>
            </span>
            {role && (
              <span className={cn("ml-1.5 rounded px-1.5 py-0.5 text-xs font-medium",
                role === "blog" ? "bg-blue-100 text-blue-600" : "bg-zinc-100 text-zinc-500")}>
                {role === "blog" ? "Blog" : "Store"}
              </span>
            )}
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <NavLinks />
        </nav>
        <div className="border-t border-zinc-100 p-4">
          <button onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 transition hover:bg-red-50 hover:text-red-500">
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

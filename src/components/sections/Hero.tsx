"use client";

import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { Phone, Sparkles } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/utils";
import { useEffect, useState } from "react";

const WHATSAPP_NUMBER = "919164363131";
const PHONE_NUMBER = "919164363131";

const COLOR_TEXT: Record<string, string> = {
  yellow: "text-yellow-300",
  pink: "text-pink-300",
  green: "text-green-300",
  blue: "text-blue-300",
  purple: "text-purple-300",
  orange: "text-orange-300",
};

const COLOR_BORDER: Record<string, string> = {
  yellow: "border-yellow-400/40",
  pink: "border-pink-400/40",
  green: "border-green-400/40",
  blue: "border-blue-400/40",
  purple: "border-purple-400/40",
  orange: "border-orange-400/40",
};

const COLOR_BG: Record<string, string> = {
  yellow: "bg-yellow-400/10",
  pink: "bg-pink-400/10",
  green: "bg-green-400/10",
  blue: "bg-blue-400/10",
  purple: "bg-purple-400/10",
  orange: "bg-orange-400/10",
};

export default function Hero() {
  const [announcement, setAnnouncement] = useState<{ text: string; color: string; link: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/announcements")
      .then(r => r.ok ? r.json() : [])
      .then((items: { text: string; color: string; link: string | null; isActive: boolean }[]) => {
        const first = items.find(i => i.isActive);
        if (first) setAnnouncement({ text: first.text, color: first.color, link: first.link || "/booking" });
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 pt-20">
      <Image
        src="/images/women-hair.jpg"
        alt="Spin Unisex Salon Kudlu Bengaluru - premium hair and beauty salon near HSR Layout"
        fill
        priority
        className="object-cover object-[left_20%] md:object-[center_25%]"
        sizes="100vw"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-zinc-950/60" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Offer badge */}
        <div className="mb-8 flex justify-center min-h-[2.5rem] items-center">
          {announcement && (
            <Link href={announcement.link} className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold backdrop-blur-sm transition-opacity hover:opacity-80 ${COLOR_BG[announcement.color]} ${COLOR_BORDER[announcement.color]} ${COLOR_TEXT[announcement.color]}`}>
              <Sparkles size={14} className="shrink-0" />
              {announcement.text}
            </Link>
          )}
        </div>

        {/* Eyebrow */}
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">
          Kudlu Gate · Bengaluru
        </p>

        {/* Heading */}
        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
          Look Sharp,{" "}
          <span className="text-zinc-300">Feel Great</span>
        </h1>

        <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-zinc-300">
          Expert stylists. Premium products. A welcoming space for everyone — near HSR Layout.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/booking">
            <Button variant="light" size="lg">Book Your Appointment</Button>
          </Link>
          <a
            href={`tel:${PHONE_NUMBER}`}
            onClick={() => fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ page: "call-button" }) }).catch(() => {})}
          >
            <Button variant="outline-light" size="lg"><Phone size={18} /> Call Now</Button>
          </a>
          <a
            href={buildWhatsAppUrl(WHATSAPP_NUMBER, "Hi! I'd like to book an appointment.")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ page: "whatsapp-button" }) }).catch(() => {})}
          >
            <Button variant="outline-light" size="lg">Chat on WhatsApp</Button>
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 border-t border-white/10 pt-10">
          {[
            { value: "15+", label: "Years of Excellence" },
            { value: "100+", label: "Outlets Across India" },
            { value: "5.0 ★", label: "Google Rating" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</div>
              <div className="mt-1 text-xs text-zinc-400 sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

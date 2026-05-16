"use client";

import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { Phone } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/utils";

const WHATSAPP_NUMBER = "919164363131";
const PHONE_NUMBER = "919164363131";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-20">
      {/* Background photo from menu cover */}
      <Image
        src="/images/hero-cover.jpg"
        alt="Spin Unisex Salon Kudlu Bengaluru - premium hair and beauty salon near HSR Layout"
        fill
        priority
        className="object-cover object-center"
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-zinc-900/70" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Offer badges */}
        <div className="mb-8 flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-5 py-2 text-sm font-semibold text-yellow-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
            New clients: 20% off above ₹2000
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-green-400/40 bg-green-400/10 px-5 py-2 text-sm font-semibold text-green-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            New clients: 15% off above ₹1000
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-400/40 bg-pink-400/10 px-5 py-2 text-sm font-semibold text-pink-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
            Permanent Blowdry — Any Length ₹7,000
          </div>
        </div>

        {/* Spin logo mark */}
        <div className="mb-6 flex justify-center">
          <div className="relative h-16 w-16">
            <Image
              src="/images/spin-logo.png"
              alt="Spin Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Heading */}
        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
          Look Sharp,{" "}
          <span className="text-zinc-300">Feel Great</span>
        </h1>

        <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-zinc-300 sm:text-xl">
          Expert stylists. Premium products. A welcoming space for everyone —
          in Kudlu, Bengaluru — near HSR Layout.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/booking">
            <Button variant="light" size="lg">Book Your Appointment</Button>
          </Link>
          <a href={`tel:${PHONE_NUMBER}`}
            onClick={() => fetch("/api/analytics", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ page: "call-button" }),
            }).catch(() => {})}>
            <Button variant="outline-light" size="lg">
              <Phone size={18} /> Call Now
            </Button>
          </a>
          <a
            href={buildWhatsAppUrl(WHATSAPP_NUMBER, "Hi! I'd like to learn more about your services.")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ page: "whatsapp-button" }) }).catch(() => {})}
          >
            <Button variant="outline-light" size="lg">Chat on WhatsApp</Button>
          </a>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 border-t border-white/10 pt-10">
          {[
            { value: "15+", label: "Years of Excellence" },
            { value: "100+", label: "Outlets Across India" },
            { value: "6", label: "Expert Stylists" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="mt-1 text-sm text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Phone, MapPin, Mail, Clock } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/utils";
import PageAnalytics from "@/components/PageAnalytics";

const WHATSAPP_NUMBER = "918088042521";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <>
      <PageAnalytics page="contact" />

      {/* Header */}
      <div className="bg-zinc-900 px-4 pt-32 pb-20 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
          Get In Touch
        </p>
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Contact Us</h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          Have a question or want to know more? We'd love to hear from you.
        </p>
      </div>

      <section className="bg-white px-4 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          {/* Info */}
          <div>
            <h2 className="mb-8 text-2xl font-extrabold text-zinc-900">Salon Information</h2>

            <ul className="mb-10 space-y-5">
              <li className="flex items-start gap-4">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-700">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900">Address</p>
                  <p className="text-zinc-500">Kudlu Main Road, Kudlu Gate, Bengaluru, Karnataka 560068</p>
                  <p className="mt-0.5 text-xs text-zinc-400">Near HSR Layout, Silk Board</p>
                  <a
                    href="https://maps.app.goo.gl/uztdRtsVakV416SR7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white hover:bg-zinc-700 transition"
                  >
                    <MapPin size={11} /> Get Directions
                  </a>
                </div>
              </li>
              <li>
                <a href="tel:01205244768" className="flex items-start gap-4 transition hover:text-zinc-700">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-700">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900">Phone (Click to Call)</p>
                    <p className="text-zinc-500">0120-524-4768</p>
                  </div>
                </a>
              </li>
              <li>
                <a href="mailto:hello@spinkudlu.com" className="flex items-start gap-4 transition hover:text-zinc-700">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-700">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900">Email</p>
                    <p className="text-zinc-500">hello@spinkudlu.com</p>
                  </div>
                </a>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-700">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900">Hours</p>
                  <p className="text-zinc-500">Mon–Fri: 9:00 AM – 6:00 PM</p>
                  <p className="text-zinc-500">Saturday: 9:00 AM – 5:00 PM</p>
                  <p className="text-zinc-500">Sunday: Closed</p>
                </div>
              </li>
            </ul>

            {/* WhatsApp */}
            <a
              href={buildWhatsAppUrl(WHATSAPP_NUMBER, "Hi! I'd like to know more about Spin Unisex Salon.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-green-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-green-600 hover:shadow-md"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.123 1.527 5.855L0 24l6.335-1.506A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.504-5.17-1.385l-.37-.218-3.762.895.953-3.65-.24-.383A9.964 9.964 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Chat on WhatsApp
            </a>

            {/* Google Maps Embed */}
            <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-100">
              <iframe
                src="https://maps.google.com/maps?q=Spin+Unisex+Salon+Kudlu+Gate+Bengaluru&t=&z=17&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Spin Unisex Salon Location"
              />
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="mb-8 text-2xl font-extrabold text-zinc-900">Send a Message</h2>

            {status === "success" ? (
              <div className="rounded-2xl bg-green-50 p-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                  ✓
                </div>
                <h3 className="mb-2 font-bold text-zinc-900">Message Sent!</h3>
                <p className="text-zinc-500">We'll get back to you as soon as possible.</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-4 text-sm text-zinc-700 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Full Name"
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Doe"
                />
                <Input
                  label="Email"
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@example.com"
                />
                <Input
                  label="Phone (optional)"
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-zinc-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="How can we help you?"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm text-red-500">{errorMsg}</p>
                )}

                <Button type="submit" loading={status === "loading"} className="w-full">
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

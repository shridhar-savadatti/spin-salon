import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/sections/Hero";
import ServicesHighlight from "@/components/sections/ServicesHighlight";
import Testimonials from "@/components/sections/Testimonials";
import OfferBanner from "@/components/sections/OfferBanner";
import FeaturedService from "@/components/sections/FeaturedService";
import BookingCTA from "@/components/sections/BookingCTA";
import PageAnalytics from "@/components/PageAnalytics";

export const metadata: Metadata = {
  title: "Best Unisex Salon near HSR Layout & Kudlu Gate, Bengaluru | Spin",
  description: "Looking for a unisex salon near you in Bengaluru? Spin Unisex Salon at Kudlu Gate serves HSR Layout, Bommanahalli, Silk Board & BTM Layout. Haircuts, colour, facials, waxing, nails & bridal. Book online!",
  alternates: { canonical: "https://www.spinkudlu.com" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Where is Spin Unisex Salon located in Bengaluru?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Spin Unisex Salon is located on Kudlu Main Road, Kudlu Gate, Bengaluru – 560068, near HSR Layout, Bommanahalli, and Silk Board.",
      },
    },
    {
      "@type": "Question",
      name: "What are the opening hours of Spin Unisex Salon Kudlu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We are open every day from 8:30 AM to 9:00 PM, including weekends and public holidays.",
      },
    },
    {
      "@type": "Question",
      name: "How do I book an appointment at Spin Unisex Salon?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can book online at spinkudlu.com/booking, call us at +91 91643 63131, or WhatsApp us directly.",
      },
    },
    {
      "@type": "Question",
      name: "What services does Spin Unisex Salon offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We offer haircuts for men and women, hair colouring, balayage, smoothing, facials, waxing, nail art, bridal makeup packages, and spa treatments.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer discounts for new clients?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! New clients get 20% off on bills above ₹2000 and 15% off on bills above ₹1000. No coupon code needed — just mention it at the salon.",
      },
    },
    {
      "@type": "Question",
      name: "Does Spin Unisex Salon accept walk-ins?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, we accept walk-ins based on availability. To avoid waiting, we recommend booking an appointment online at spinkudlu.com/booking.",
      },
    },
    {
      "@type": "Question",
      name: "Is Spin a unisex salon near HSR Layout?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Spin is a fully unisex salon serving men, women, and kids. Located at Kudlu Gate, we are just minutes from HSR Layout, Bommanahalli, Silk Board, BTM Layout, and Agara. We offer haircuts, hair colour, facials, waxing, nails, and bridal packages for all.",
      },
    },
    {
      "@type": "Question",
      name: "Which areas near Bengaluru does Spin Unisex Salon serve?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Spin Unisex Salon at Kudlu Gate, Bengaluru serves customers from HSR Layout, Bommanahalli, Silk Board, BTM Layout, Agara, Hongasandra, Begur Road, and surrounding areas.",
      },
    },
  ],
};

function NearbySection() {
  const areas = [
    "HSR Layout", "Bommanahalli", "Silk Board", "BTM Layout",
    "Agara", "Hongasandra", "Begur Road", "Kudlu Gate",
  ];
  return (
    <section className="bg-zinc-950 px-4 py-14">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Serving Bengaluru</p>
        <h2 className="mb-2 text-2xl font-extrabold text-white">
          The Unisex Salon Near You
        </h2>
        <p className="mb-8 text-sm text-zinc-400">
          Spin is Bengaluru&apos;s go-to unisex salon for men, women &amp; kids — conveniently located at Kudlu Gate, minutes from:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {areas.map(area => (
            <span key={area} className="rounded-full border border-zinc-700 bg-zinc-800 px-4 py-1.5 text-xs font-semibold text-zinc-300">
              {area}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocationSection() {
  const details = [
    { label: "Address", value: "Kudlu Main Road, Kudlu Gate, Bengaluru – 560068" },
    { label: "Hours", value: "Open daily · 8:30 AM – 9:00 PM" },
    { label: "Phone", value: "+91 91643 63131" },
    { label: "Near", value: "HSR Layout · Silk Board · Bommanahalli · BTM Layout" },
  ];

  return (
    <section className="bg-zinc-900 px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-zinc-500">Visit Us</p>
          <h2 className="text-3xl font-extrabold text-white">Find Spin Salon</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {details.map((d) => (
            <div key={d.label} className="rounded-2xl border border-zinc-700/60 bg-zinc-800/40 px-6 py-5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">{d.label}</p>
              <p className="text-sm font-medium text-zinc-200">{d.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-400 hover:text-white"
          >
            Get Directions &amp; Full Details →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PageAnalytics page="home" />
      <Hero />
      <ServicesHighlight />
      <OfferBanner />
      <FeaturedService />
      <NearbySection />
      <LocationSection />
      <Testimonials />
      <BookingCTA />
    </>
  );
}

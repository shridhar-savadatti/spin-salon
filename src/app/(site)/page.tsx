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
  title: "Book Now – Spin Unisex Salon | Kudlu Gate, Bengaluru",
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
  ],
};

function LocationSection() {
  return (
    <section className="bg-zinc-900 px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold text-white">
            Spin Unisex Salon — Kudlu Gate, Bengaluru
          </h2>
          <p className="mt-2 text-zinc-400">
            Premium hair &amp; beauty salon on Kudlu Main Road, near HSR Layout, Silk Board &amp; Bommanahalli.
            Open daily 8:30 AM – 9:00 PM.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "Salon near HSR Layout", "Salon near Silk Board", "Salon in Kudlu Gate",
            "Unisex Salon Bommanahalli", "Hair Salon BTM Layout", "Beauty Salon Electronic City",
            "Salon near Sarjapur Road", "Haircut near Koramangala",
          ].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/contact"
            className="text-sm font-semibold text-zinc-300 underline underline-offset-4 hover:text-white"
          >
            Get directions &amp; contact details →
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
      <LocationSection />
      <Testimonials />
      <BookingCTA />
    </>
  );
}

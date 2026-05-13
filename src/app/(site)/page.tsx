import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import ServicesHighlight from "@/components/sections/ServicesHighlight";
import Testimonials from "@/components/sections/Testimonials";
import OfferBanner from "@/components/sections/OfferBanner";
import BookingCTA from "@/components/sections/BookingCTA";
import PageAnalytics from "@/components/PageAnalytics";

export const metadata: Metadata = {
  title: "Book Now – Spin Unisex Salon | Kudlu Gate, Bengaluru",
  alternates: { canonical: "https://www.spinkudlu.com" },
};

export default function HomePage() {
  return (
    <>
      <PageAnalytics page="home" />
      <Hero />
      <ServicesHighlight />
      <OfferBanner />
      <Testimonials />
      <BookingCTA />
    </>
  );
}

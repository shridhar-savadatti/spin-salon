import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import PageAnalytics from "@/components/PageAnalytics";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse our salon gallery — haircuts, coloring, skincare, nails, and bridal transformations at Spin Unisex Salon Bengaluru.",
  alternates: { canonical: "https://spinkudlu.com/gallery" },
  openGraph: { url: "https://spinkudlu.com/gallery" },
};

const GALLERY = [
  {
    src: "/images/women-hair.jpg",
    alt: "Women's hair styling and colour at Spin Unisex Salon Kudlu Bengaluru",
    label: "Women's Hair",
    category: "Hair",
  },
  {
    src: "/images/men-hair.jpg",
    alt: "Men's precision haircut at Spin Unisex Salon near HSR Layout Bengaluru",
    label: "Men's Haircut",
    category: "Hair",
  },
  {
    src: "/images/men-styling.jpg",
    alt: "Men's hair styling and grooming at Spin Unisex Salon Kudlu Gate",
    label: "Men's Styling",
    category: "Hair",
  },
  {
    src: "/images/skincare.jpg",
    alt: "Skincare and facial treatment at Spin Unisex Salon Kudlu Bengaluru",
    label: "Skincare & Facials",
    category: "Skincare",
  },
  {
    src: "/images/facial.jpg",
    alt: "Premium facial treatment near HSR Layout at Spin Unisex Salon",
    label: "Facial Treatment",
    category: "Skincare",
  },
  {
    src: "/images/nails.jpg",
    alt: "Holographic gel nail art at Spin Unisex Salon Kudlu Bengaluru",
    label: "Nail Art",
    category: "Nails",
  },
  {
    src: "/images/bridal.jpg",
    alt: "Bridal makeup package at Spin Unisex Salon Kudlu near HSR Layout",
    label: "Bridal Makeup",
    category: "Bridal",
  },
  {
    src: "/images/groom.jpg",
    alt: "Groom services and makeover at Spin Unisex Salon Kudlu Bengaluru",
    label: "Groom Services",
    category: "Bridal",
  },
  {
    src: "/images/hero-cover.jpg",
    alt: "Hair transformation results at Spin Unisex Salon Kudlu Bengaluru",
    label: "Hair Transformation",
    category: "Hair",
  },
];

export default function GalleryPage() {
  return (
    <>
      <PageAnalytics page="gallery" />

      <div className="bg-zinc-900 px-4 pt-32 pb-20 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">Our Work</p>
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Gallery</h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          Real results from real clients at Spin Unisex Salon, Kudlu, Bengaluru.
        </p>
      </div>

      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
            {GALLERY.map((item) => (
              <div key={item.label} className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl">
                <div className="relative">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={600}
                    height={800}
                    className="w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <div>
                      <p className="text-sm font-bold text-white">{item.label}</p>
                      <p className="text-xs text-white/70">{item.category}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-zinc-900 py-16 text-center">
        <p className="mb-4 text-zinc-400">Love what you see? Book your transformation today.</p>
        <Link href="/booking">
          <Button variant="light" size="lg">Book an Appointment</Button>
        </Link>
      </div>
    </>
  );
}

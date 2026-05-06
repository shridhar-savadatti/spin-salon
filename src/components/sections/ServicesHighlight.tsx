import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

const FEATURED = [
  { title: "Women's Hair", category: "Women's Hair", description: "Cuts, colour, balayage, keratin, spa and treatments by expert stylists.", image: "/images/women-hair.jpg", alt: "Women's hair salon services — cuts, colour and balayage in Kudlu Bengaluru" },
  { title: "Men's Hair & Grooming", category: "Men's Hair", description: "Precision cuts, fades, beard styling, colour and scalp treatments.", image: "/images/men-hair.jpg", alt: "Men's haircut and grooming at Spin Unisex Salon near HSR Layout Bengaluru" },
  { title: "Skincare & Facials", category: "Skincare", description: "Threading, clean-ups, de-tan, bleach, and premium facials.", image: "/images/skincare.jpg", alt: "Skincare facials and clean-up treatments at Spin Unisex Salon Kudlu" },
  { title: "Waxing", category: "Waxing", description: "Honey, chocolate, liposoluble and bead wax for face and body.", image: "/images/facial.jpg", alt: "Professional waxing services at Spin Unisex Salon Kudlu Gate Bengaluru" },
  { title: "Nails", category: "Nails", description: "Manicures, pedicures, gel polish, extensions and nail art.", image: "/images/nails.jpg", alt: "Nail art gel extensions and manicure pedicure at Spin Unisex Salon Kudlu" },
  { title: "Bridal & Groom", category: "Bridal & Groom", description: "Complete bridal and groom packages — makeup, hair and skin.", image: "/images/bride-photo.jpg", alt: "Bridal makeup and pre-bride packages at Spin Unisex Salon Kudlu Bengaluru" },
];

export default function ServicesHighlight() {
  return (
    <section className="bg-white py-24 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">What We Offer</p>
          <h2 className="text-4xl font-extrabold text-zinc-900">Our Signature Services</h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-500">From classic cuts to luxury treatments — everything under one roof in Kudlu, Bengaluru.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((service) => (
            <Link
              key={service.title}
              href={`/booking?category=${encodeURIComponent(service.category)}`}
              className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:border-zinc-900 hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden">
                <Image src={service.image} alt={service.alt} fill className="object-cover object-top transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h3 className="absolute bottom-4 left-4 text-lg font-extrabold text-white drop-shadow">{service.title}</h3>
              </div>
              <div className="p-5">
                <p className="mb-4 text-sm leading-relaxed text-zinc-500">{service.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-900 transition-all group-hover:gap-2">
                  Book Now <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/services">
            <Button variant="outline" size="lg">View All Services & Pricing <ArrowRight size={16} /></Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

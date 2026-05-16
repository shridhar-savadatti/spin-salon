import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { Sparkles, Clock, ArrowRight } from "lucide-react";

export default function FeaturedService() {
  return (
    <section className="bg-white px-4 py-16">
      <div className="mx-auto max-w-5xl">

        {/* Label */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <Sparkles size={16} className="text-zinc-400" />
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Now Available</p>
          <Sparkles size={16} className="text-zinc-400" />
        </div>

        <div className="overflow-hidden rounded-3xl border-2 border-zinc-900 bg-zinc-900 shadow-2xl lg:flex">

          {/* Image */}
          <div className="relative h-64 w-full shrink-0 lg:h-auto lg:w-80">
            <Image
              src="/images/women-hair.jpg"
              alt="Permanent Blowdry at Spin Unisex Salon Kudlu Bengaluru"
              fill
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent lg:bg-gradient-to-r" />
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col justify-center px-8 py-10">
            <span className="mb-3 inline-block w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Signature Service
            </span>

            <h2 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">
              Permanent Blowdry
            </h2>

            <p className="mb-6 text-zinc-300 leading-relaxed">
              Get salon-smooth, frizz-free hair that lasts. Our Permanent Blowdry treatment works on
              <strong className="text-white"> all hair lengths</strong> — short, medium or long.
              Wake up every morning with perfectly styled hair.
            </p>

            <div className="mb-8 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5">
                <span className="text-lg font-extrabold text-white">₹7,000</span>
                <span className="text-zinc-400">onwards</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5">
                <Clock size={14} className="text-zinc-400" />
                <span className="text-zinc-300">All hair lengths</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5">
                <span className="text-zinc-300">✓ Long-lasting results</span>
              </div>
            </div>

            <Link href="/booking?service=w-permanent-blowdry">
              <Button variant="light" size="lg" className="w-full sm:w-auto">
                Book Permanent Blowdry <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

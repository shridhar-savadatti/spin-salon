import Link from "next/link";
import Button from "@/components/ui/Button";

export default function OfferBanner() {
  return (
    <section className="bg-zinc-800 py-16 px-4">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-6 text-sm font-semibold uppercase tracking-widest text-zinc-400">
          Exclusive Offers for New Clients
        </p>

        {/* Offers */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {/* Offer 1 */}
          <div className="rounded-2xl bg-white/10 p-5 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">On bills above ₹2000</p>
            <p className="text-2xl font-extrabold text-white mb-1">20% Off</p>
            <p className="text-sm text-zinc-300 mb-3">Use code at checkout</p>
            <span className="rounded bg-white/20 px-3 py-1 font-mono font-bold text-white text-sm">
              WELCOME20
            </span>
          </div>

          {/* Offer 2 */}
          <div className="rounded-2xl bg-white/10 p-5 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">On bills above ₹1000</p>
            <p className="text-2xl font-extrabold text-white mb-1">15% Off</p>
            <p className="text-sm text-zinc-300 mb-3">Use code at checkout</p>
            <span className="rounded bg-white/20 px-3 py-1 font-mono font-bold text-white text-sm">
              WELCOME15
            </span>
          </div>
        </div>

        {/* Permanent Blowdry highlight */}
        <div className="mb-8 rounded-2xl border border-white/20 bg-white/5 px-6 py-4">
          <p className="text-sm text-zinc-400 mb-1">✨ Now Available</p>
          <p className="text-lg font-extrabold text-white">
            Permanent Blowdry — Any Length
            <span className="ml-3 text-zinc-300 font-semibold">₹7,000*</span>
          </p>
        </div>

        <Link href="/booking">
          <Button variant="light" size="lg">
            Book & Claim Discount
          </Button>
        </Link>
      </div>
    </section>
  );
}

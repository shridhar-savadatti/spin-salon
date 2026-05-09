import Link from "next/link";
import Button from "@/components/ui/Button";

export default function OfferBanner() {
  return (
    <section className="bg-zinc-800 py-16 px-4">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
          Limited Time Offer
        </p>
        <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
          New Clients Get 20% Off on Services Above ₹2000
        </h2>
        <p className="mb-8 text-zinc-300">
          Book your first appointment and receive 20% off on any service above ₹2000. Use code{" "}
          <span className="rounded bg-white/15 px-2 py-0.5 font-mono font-bold text-white">
            WELCOME20
          </span>{" "}
          at checkout.
        </p>
        <Link href="/booking">
          <Button variant="light" size="lg">
            Claim Your Discount
          </Button>
        </Link>
      </div>
    </section>
  );
}

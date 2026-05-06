import Link from "next/link";
import Button from "@/components/ui/Button";

export default function BookingCTA() {
  return (
    <section className="bg-zinc-900 py-24 px-4">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-zinc-400">
          Ready to Look Great?
        </p>
        <h2 className="mb-5 text-4xl font-extrabold text-white sm:text-5xl">
          Book Your Appointment Today
        </h2>
        <p className="mb-10 text-zinc-400">
          It takes less than 2 minutes. Choose your service, pick a time, and we'll see you soon.
        </p>
        <Link href="/booking">
          <Button variant="light" size="lg">
            Book Now — It's Free
          </Button>
        </Link>
      </div>
    </section>
  );
}

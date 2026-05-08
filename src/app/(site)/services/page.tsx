import type { Metadata } from "next";
import Link from "next/link";
import { SERVICES, SERVICE_CATEGORIES } from "@/lib/services-data";
import { formatCurrency } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { Clock, ArrowRight } from "lucide-react";
import PageAnalytics from "@/components/PageAnalytics";

export const metadata: Metadata = {
  title: "Services & Pricing",
  description: "Explore all hair, skin, nail, and treatment services at Spin Unisex Salon Bengaluru with transparent pricing.",
  alternates: { canonical: "https://www.spinkudlu.com/services" },
  openGraph: { url: "https://www.spinkudlu.com/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageAnalytics page="services" />

      <div className="bg-zinc-900 px-4 pt-32 pb-20 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">What We Offer</p>
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Services & Pricing</h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          Professional services with transparent pricing. All treatments include a complimentary consultation.
        </p>
      </div>

      <div className="bg-white px-4 py-20">
        <div className="mx-auto max-w-7xl space-y-16">
          {SERVICE_CATEGORIES.map((category) => {
            const categoryServices = SERVICES.filter((s) => s.category === category);
            return (
              <div key={category}>
                <div className="mb-8 flex items-center gap-4">
                  <h2 className="text-2xl font-extrabold text-zinc-900">{category}</h2>
                  <div className="h-px flex-1 bg-zinc-100" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex flex-col justify-between rounded-2xl border border-zinc-100 bg-zinc-50 p-5 transition hover:border-zinc-400 hover:shadow-md"
                    >
                      <div>
                        <h3 className="mb-1 font-bold text-zinc-900">{service.name}</h3>
                        <p className="text-sm text-zinc-500">{service.description}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xl font-extrabold text-zinc-900">
                          {formatCurrency(service.price)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-zinc-400">
                          <Clock size={13} />
                          {service.duration} min
                        </span>
                      </div>
                      <Link href={`/booking?service=${service.id}`} className="mt-4">
                        <Button variant="outline" size="sm" className="w-full gap-1">
                          Book This <ArrowRight size={14} />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-zinc-900 py-20 text-center">
        <h2 className="mb-4 text-3xl font-extrabold text-white">Ready to book?</h2>
        <p className="mb-8 text-zinc-400">Choose your service and find a time that works for you.</p>
        <Link href="/booking">
          <Button variant="light" size="lg">Book an Appointment</Button>
        </Link>
      </div>
    </>
  );
}

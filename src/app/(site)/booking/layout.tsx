import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description: "Book your hair, skin, or nail appointment at Spin Unisex Salon, Kudlu, Bengaluru. Choose your service and preferred time online.",
  alternates: {
    canonical: "https://www.spinkudlu.com/booking",
  },
  openGraph: {
    url: "https://www.spinkudlu.com/booking",
  },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

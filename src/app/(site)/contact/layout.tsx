import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Location | Spin Unisex Salon Kudlu Gate, Bengaluru",
  description: "Visit Spin Unisex Salon at Kudlu Main Road, Kudlu Gate, Bengaluru 560068. Serving Kudlu, HSR Layout, Bommanahalli, Silk Board, BTM Layout & Electronic City. Open daily 8:30 AM – 9:00 PM. Call +91 91643 63131.",
  keywords: ["salon Kudlu Gate", "unisex salon near HSR Layout", "beauty salon Bommanahalli", "hair salon Silk Board", "salon near Electronic City", "spin salon Bengaluru contact", "salon near BTM Layout"],
  alternates: {
    canonical: "https://www.spinkudlu.com/contact",
  },
  openGraph: {
    url: "https://www.spinkudlu.com/contact",
    title: "Contact & Location | Spin Unisex Salon Kudlu Gate Bengaluru",
    description: "Kudlu Main Road, Kudlu Gate, Bengaluru 560068. Near HSR Layout, Silk Board & Bommanahalli. Open daily 8:30 AM – 9 PM.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}

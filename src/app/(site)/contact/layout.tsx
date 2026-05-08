import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Spin Unisex Salon. Visit us at Kudlu, Bengaluru, call us, or send a message via WhatsApp.",
  alternates: {
    canonical: "https://www.spinkudlu.com/contact",
  },
  openGraph: {
    url: "https://www.spinkudlu.com/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}

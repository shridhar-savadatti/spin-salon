import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

const BASE_URL = "https://www.spinkudlu.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Book Now – Spin Unisex Salon | Kudlu Gate, Bengaluru",
    template: "%s | Spin Unisex Salon | Book Now",
  },
  description:
    "Spin Unisex Salon, Kudlu Gate, Bengaluru — Near HSR Layout. Book online! New clients get 20% off (use WELCOME20). Haircuts, colour, facials, waxing, nails & bridal packages.",
  keywords: ["unisex salon", "haircut", "hair coloring", "beauty", "balayage", "facial", "nails", "Bengaluru", "Bangalore", "Kudlu", "HSR Layout", "spin salon", "Karnataka"],
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "Spin Unisex Salon",
    title: "Spin Unisex Salon — Premium Hair & Beauty | Bengaluru",
    description: "Spin Unisex Salon in Kudlu, Bengaluru — haircuts, colouring, facials, nails and more. Near HSR Layout.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spin Unisex Salon — Premium Hair & Beauty | Bengaluru",
    description: "Spin Unisex Salon in Kudlu, Bengaluru — haircuts, colouring, facials, nails and more. Near HSR Layout.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  name: "Spin Unisex Salon",
  description: "Spin Unisex Salon in Kudlu, Bengaluru — premium haircuts, colouring, facials, nails and more. Near HSR Layout.",
  url: BASE_URL,
  telephone: "0120-524-4768",
  email: "spinsalonkudlu2431@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kudlu Main Road, Kudlu Gate",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    postalCode: "560068",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 12.9082,
    longitude: 77.6476,
  },
  areaServed: ["Kudlu", "HSR Layout", "Bommanahalli", "Silk Board", "BTM Layout", "Bengaluru"],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "08:30",
      closes: "21:00",
    },
  ],
  priceRange: "₹₹",
  hasMap: "https://maps.app.goo.gl/uztdRtsVakV416SR7",
  sameAs: [],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        {children}
      </body>
    </html>
  );
}

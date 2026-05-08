import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Award, Heart, Leaf, Users } from "lucide-react";
import PageAnalytics from "@/components/PageAnalytics";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Spin Unisex Salon's story — founded in 2010 in Bengaluru, now 100+ outlets across India. Our Kudlu team is led by owner Munesh Chinnaswamy.",
  alternates: { canonical: "https://spinkudlu.com/about" },
  openGraph: { url: "https://spinkudlu.com/about" },
};

const TEAM = [
  { name: "Munesh Chinnaswamy", role: "Owner", bio: "Passionate about delivering premium salon experiences. Leads the Kudlu outlet with a focus on quality and client happiness.", initials: "MC", highlight: true },
  { name: "Rakesh", role: "Hair Dresser", bio: "Expert in precision cuts and modern styling techniques for all hair types.", initials: "R" },
  { name: "Guru", role: "Hair Dresser", bio: "Skilled in creative cuts, balayage, and hair colour transformations.", initials: "G" },
  { name: "Rajat", role: "Hair Dresser", bio: "Specialises in men's grooming, fades, and contemporary hairstyles.", initials: "Rj" },
  { name: "Reshma", role: "Beautician", bio: "Expert in facials, skin treatments, and bridal beauty packages.", initials: "Re" },
  { name: "Purnima", role: "Beautician", bio: "Specialises in threading, waxing, and traditional beauty rituals.", initials: "P" },
  { name: "Amisha", role: "Beautician", bio: "Nail artist and skin care specialist with an eye for detail.", initials: "A" },
];

const VALUES = [
  { icon: Heart, title: "Client First", desc: "Every decision starts with what makes our clients feel amazing." },
  { icon: Award, title: "Expert Craft", desc: "15+ years of innovation and ongoing education keeps our team at the cutting edge." },
  { icon: Leaf, title: "Clean Products", desc: "We use professional, cruelty-free products that are kind to hair and planet." },
  { icon: Users, title: "Inclusive Space", desc: "A welcoming environment for everyone, regardless of background or gender." },
];

export default function AboutPage() {
  return (
    <>
      <PageAnalytics page="about" />

      {/* Hero */}
      <div className="relative bg-zinc-900 px-4 pt-32 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image src="/images/womens-hair.jpg" alt="Women's hair styling at Spin Unisex Salon Kudlu Bengaluru" fill className="object-cover object-top" />
        </div>
        <div className="relative z-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">Our Story</p>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">About Spin Unisex Salon</h1>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
            Founded in 2010 in Bengaluru with just 7 passionate souls. Today, one of India's
            fastest-growing salon chains with 100+ outlets.
          </p>
        </div>
      </div>

      {/* Brand Story */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative h-20 w-20">
              <Image src="/images/spin-logo.png" alt="Spin Logo" fill className="object-contain" />
            </div>
          </div>
          <h2 className="mb-6 text-3xl font-extrabold text-zinc-900">Where Every Turn Tells a Story</h2>
          <p className="mb-4 leading-relaxed text-zinc-600">
            From our humble beginning in 2010 — with just seven passionate souls in a cozy Bengaluru
            space — to scaling over 100 vibrant outlets in 2025, we've spun dreams into reality
            one stylish step at a time.
          </p>
          <p className="leading-relaxed text-zinc-600">
            Each service is backed by years of innovation, built on our foundation of trust,
            community spirit, and unstoppable energy. You're not just picking a service;
            you're stepping into a legacy of beauty, boldness, and brilliance.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-zinc-100 px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-extrabold text-zinc-900">Our Values</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 text-zinc-700">
                  <v.icon size={22} />
                </div>
                <h3 className="mb-2 font-bold text-zinc-900">{v.title}</h3>
                <p className="text-sm text-zinc-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-zinc-500">The Experts</p>
            <h2 className="text-3xl font-extrabold text-zinc-900">Meet Our Team</h2>
            <p className="mt-3 text-zinc-500">Kudlu outlet — led by our owner Munesh Chinnaswamy</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member) => (
              <div key={member.name} className={`rounded-2xl p-6 text-center ${member.highlight ? "bg-zinc-900 text-white" : "bg-zinc-50 border border-zinc-100"}`}>
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold ${member.highlight ? "bg-white text-zinc-900" : "bg-zinc-900 text-white"}`}>
                  {member.initials}
                </div>
                <h3 className={`font-bold ${member.highlight ? "text-white" : "text-zinc-900"}`}>{member.name}</h3>
                <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${member.highlight ? "text-zinc-400" : "text-zinc-500"}`}>{member.role}</p>
                <p className={`text-sm ${member.highlight ? "text-zinc-300" : "text-zinc-500"}`}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="bg-zinc-900 py-20 text-center">
        <h2 className="mb-4 text-3xl font-extrabold text-white">Meet Us in Person</h2>
        <p className="mb-8 text-zinc-400">The best way to experience our team is to book an appointment.</p>
        <Link href="/booking">
          <Button variant="light" size="lg">Book Your Visit</Button>
        </Link>
      </div>
    </>
  );
}

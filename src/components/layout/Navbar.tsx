"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Pages that have a dark hero — navbar starts transparent with white text
const DARK_HERO_PAGES = ["/", "/services", "/gallery", "/about", "/contact", "/blog"];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Pages without dark hero always show white navbar
  const hasDarkHero = DARK_HERO_PAGES.some(p =>
    p === "/" ? pathname === "/" : pathname?.startsWith(p)
  );
  const isWhite = !hasDarkHero || scrolled;

  useEffect(() => {
    // Set initial scroll state
    setScrolled(window.scrollY > 20);
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-8 z-50 w-full transition-all duration-300",
        isWhite ? "bg-white/95 shadow-sm backdrop-blur-sm" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-zinc-900 shadow-sm">
            <Image
              src="/images/spin-logo.png"
              alt="Spin Logo"
              fill
              className="object-contain p-0.5"
            />
          </div>
          <span className={cn(
            "text-xl font-bold tracking-tight transition-colors duration-300",
            isWhite ? "text-zinc-900" : "text-white"
          )}>
            Spin <span className={isWhite ? "text-zinc-500" : "text-zinc-300"}>Unisex Salon</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors duration-300",
                isWhite ? "text-zinc-600 hover:text-zinc-900" : "text-zinc-300 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:block">
          <Link href="/booking">
            {isWhite ? (
              <Button size="sm">Book Appointment</Button>
            ) : (
              <Button size="sm" className="border border-white/50 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-zinc-900">
                Book Appointment
              </Button>
            )}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className={cn(
            "rounded-lg p-2 transition-colors duration-300 md:hidden",
            isWhite ? "text-zinc-600 hover:bg-zinc-100" : "text-white hover:bg-white/10"
          )}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-zinc-100 bg-white px-4 pb-6 pt-4 shadow-lg md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-3 text-base font-medium text-zinc-700 hover:text-zinc-900"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/booking" onClick={() => setOpen(false)}>
            <Button className="mt-4 w-full">Book Appointment</Button>
          </Link>
        </div>
      )}
    </header>
  );
}

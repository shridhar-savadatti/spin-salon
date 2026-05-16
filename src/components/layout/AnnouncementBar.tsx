import Link from "next/link";

const items = [
  "🎉 New clients get 20% off on bills above ₹2000 — Use code WELCOME20",
  "✨ 15% off on bills above ₹1000 — Use code WELCOME15",
  "💇 Permanent Blowdry for any hair length — ₹7,000",
  "📅 Book online at spinkudlu.com — Instant confirmation",
  "📍 Kudlu Gate, Bengaluru — Near HSR Layout",
];

export default function AnnouncementBar() {
  // Duplicate items for seamless loop
  const repeated = [...items, ...items];

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-zinc-900 overflow-hidden border-b border-zinc-700" style={{ height: "32px" }}>
      <div className="flex items-center h-full">
        <div className="flex animate-marquee whitespace-nowrap">
          {repeated.map((item, i) => (
            <Link key={i} href="/booking"
              className="inline-flex items-center gap-2 px-8 text-xs font-medium text-zinc-300 hover:text-white transition-colors shrink-0">
              {item}
              <span className="text-zinc-600 mx-4">•</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

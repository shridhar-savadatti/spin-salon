import Link from "next/link";

const items = [
  { text: "🎉 New clients: 20% off on bills above ₹2000 — Code WELCOME20", color: "text-yellow-300" },
  { text: "✨ New clients: 15% off on bills above ₹1000 — Code WELCOME15", color: "text-green-300" },
  { text: "💇 Permanent Blowdry for any hair length — ₹7,000", color: "text-pink-300" },
  { text: "📅 Book online instantly at spinkudlu.com", color: "text-blue-300" },
  { text: "📍 Kudlu Gate, Bengaluru — Near HSR Layout", color: "text-orange-300" },
];

export default function AnnouncementBar() {
  const repeated = [...items, ...items];

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] overflow-hidden border-b border-zinc-700 bg-zinc-950" style={{ height: "32px" }}>
      <div className="flex items-center h-full">
        <div className="flex animate-marquee whitespace-nowrap">
          {repeated.map((item, i) => (
            <Link key={i} href="/booking"
              className={`inline-flex items-center shrink-0 px-6 text-xs font-semibold transition-opacity hover:opacity-80 ${item.color}`}>
              {item.text}
              <span className="mx-6 text-zinc-600">|</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

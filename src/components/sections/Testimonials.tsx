import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    id: "1",
    name: "Priya Sharma",
    rating: 5,
    text: "Absolutely love my hair! The balayage came out better than anything I've seen on Pinterest. The team is so professional and the salon is stunning.",
    date: "March 2025",
    initials: "PS",
  },
  {
    id: "2",
    name: "Ananya Iyer",
    rating: 5,
    text: "I've been coming here for 3 years and have never been disappointed. The keratin treatment completely transformed my hair — so silky and manageable!",
    date: "February 2025",
    initials: "AI",
  },
  {
    id: "3",
    name: "Rahul Verma",
    rating: 5,
    text: "Best haircut in Bengaluru. They really listen to what you want and the result is always perfect. Clean, modern salon with a great vibe.",
    date: "January 2025",
    initials: "RV",
  },
  {
    id: "4",
    name: "Meera Nair",
    rating: 5,
    text: "Booked a bridal package and it was beyond my expectations. My hair looked amazing all day. Can't recommend them enough!",
    date: "December 2024",
    initials: "MN",
  },
  {
    id: "5",
    name: "Kavitha Reddy",
    rating: 5,
    text: "The facial was incredibly relaxing and my skin glowed for days afterwards. The staff is warm and knowledgeable.",
    date: "November 2024",
    initials: "KR",
  },
  {
    id: "6",
    name: "Arjun Malhotra",
    rating: 4,
    text: "Great experience from start to finish. Easy online booking, on time, and the result was spot on. Will definitely be back.",
    date: "October 2024",
    initials: "AM",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-zinc-100 py-24 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Client Love
          </p>
          <h2 className="text-4xl font-extrabold text-zinc-900">What Our Clients Say</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < t.rating ? "fill-zinc-700 text-zinc-700" : "text-zinc-200"}
                  />
                ))}
              </div>

              <p className="mb-6 text-sm leading-relaxed text-zinc-600">"{t.text}"</p>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{t.name}</p>
                  <p className="text-xs text-zinc-400">{t.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

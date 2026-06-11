import Link from "next/link";

const GOOGLE_REVIEWS_URL = "https://maps.app.goo.gl/uztdRtsVakV416SR7";

const REVIEWS = [
  {
    name: "Priya M.",
    text: "Best salon experience in Kudlu! The stylist really understood what I wanted. My hair colour turned out exactly as I'd imagined. Will definitely be coming back.",
    service: "Hair Colour",
  },
  {
    name: "Rahul S.",
    text: "Clean, professional, and great value. Got a precision cut and beard trim — both were spot on. The staff are friendly and the salon is well maintained.",
    service: "Haircut & Beard",
  },
  {
    name: "Deepa K.",
    text: "I got the Permanent Blowdry done here and it's been life-changing. Six weeks in and my hair still looks salon-fresh. Highly recommend!",
    service: "Permanent Blowdry",
  },
];

function Stars() {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className="h-4 w-4 fill-yellow-400">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="bg-zinc-50 py-24 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Client Reviews
          </p>
          <h2 className="text-4xl font-extrabold text-zinc-900">Trusted by Kudlu</h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} viewBox="0 0 24 24" className="h-5 w-5 fill-yellow-400">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="font-bold text-zinc-900">5.0</span>
            <span className="text-sm text-zinc-400">on Google</span>
          </div>
        </div>

        {/* Review cards */}
        <div className="grid gap-6 sm:grid-cols-3">
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <Stars />
              <p className="flex-1 text-sm leading-relaxed text-zinc-600">"{r.text}"</p>
              <div className="border-t border-zinc-100 pt-4">
                <p className="font-semibold text-zinc-900">{r.name}</p>
                <p className="text-xs text-zinc-400">{r.service} · Google Review</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-400 hover:shadow-md"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Read all reviews on Google
          </a>
        </div>
      </div>
    </section>
  );
}

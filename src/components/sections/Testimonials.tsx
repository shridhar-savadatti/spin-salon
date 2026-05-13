import Link from "next/link";

const GOOGLE_REVIEWS_URL = "https://maps.app.goo.gl/uztdRtsVakV416SR7";

export default function Testimonials() {
  return (
    <section className="bg-zinc-100 py-20 px-4">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-zinc-500">
          What Our Clients Say
        </p>
        <h2 className="text-4xl font-extrabold text-zinc-900">Trusted by Kudlu</h2>
        <p className="mx-auto mt-4 max-w-xl text-zinc-500">
          Real reviews from real customers. See what people are saying about us on Google.
        </p>

        {/* Stars */}
        <div className="my-8 flex items-center justify-center gap-1">
          {[1,2,3,4,5].map(i => (
            <svg key={i} viewBox="0 0 24 24" className="h-8 w-8 fill-yellow-400">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ))}
        </div>

        <p className="mb-8 text-2xl font-bold text-zinc-900">5.0 on Google</p>

        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 rounded-full bg-zinc-900 px-8 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-zinc-700"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Read Our Google Reviews
        </a>

        <p className="mt-6 text-sm text-zinc-400">
          Verified reviews from customers on Google Maps
        </p>
      </div>
    </section>
  );
}

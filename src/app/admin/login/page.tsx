import Image from "next/image";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 relative h-14 w-14 overflow-hidden rounded-2xl bg-zinc-900 shadow-lg">
            <Image src="/images/spin-logo.png" alt="Spin Logo" fill className="object-contain p-1" />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900">Spin Admin</h1>
          <p className="mt-1 text-sm text-zinc-500">Sign in to your dashboard</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 border border-red-200">
            {error === "invalid" ? "Incorrect username or password." : "Please fill in all fields."}
          </div>
        )}

        {/* Plain HTML form — no JavaScript needed, works on all devices */}
        <form
          action="/api/auth/login-form"
          method="POST"
          className="rounded-2xl bg-white p-8 shadow-sm space-y-4 border border-zinc-200"
        >
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-zinc-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              placeholder="Enter username"
              className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 transition focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-xl border-2 border-zinc-200 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 transition focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-zinc-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-zinc-700 active:scale-95"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

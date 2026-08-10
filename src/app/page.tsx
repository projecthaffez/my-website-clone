export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-20">
        <div className="max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            Nexus Social Platform
          </div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Connect. Share. Discover.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            A modern social networking platform built for meaningful
            connections, communities, conversations, and content sharing.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="/register"
              className="rounded-xl bg-blue-600 px-7 py-3 font-semibold transition hover:bg-blue-500"
            >
              Create Account
            </a>

            <a
              href="/login"
              className="rounded-xl border border-white/15 bg-white/5 px-7 py-3 font-semibold transition hover:bg-white/10"
            >
              Log In
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
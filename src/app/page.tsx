import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PostComposer } from "@/components/posts/PostComposer";
import { PostCard } from "@/components/posts/PostCard";

export default async function HomePage() {
  const currentUser = await getCurrentUser();

  // Logged-out users see the Nexus landing page
  if (!currentUser) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <section className="flex min-h-screen items-center justify-center px-6">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
              Nexus Social Platform
            </p>

            <h1 className="mt-5 text-5xl font-bold tracking-tight sm:text-6xl">
              Connect. Share. Discover.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              A modern social networking platform built for meaningful
              connections, communities, conversations, and content sharing.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="rounded-xl bg-blue-600 px-7 py-3 font-semibold transition hover:bg-blue-500"
              >
                Create Account
              </Link>

              <Link
                href="/login"
                className="rounded-xl border border-white/15 bg-white/5 px-7 py-3 font-semibold transition hover:bg-white/10"
              >
                Log In
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const posts = await db.post.findMany({
    where: {
      isDeleted: false,
      visibility: "PUBLIC",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: {
        select: {
          username: true,
          name: true,
          avatarUrl: true,
          isVerified: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-xl font-bold text-blue-400"
          >
            Nexus
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={`/profile/${currentUser.username}`}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Profile
            </Link>

            <Link
              href="/friends/requests"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Requests
            </Link>

            <Link
              href="/friends"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Friends
            </Link>
          </div>
        </div>
      </header>

      {/* Feed */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Welcome back, {currentUser.name}
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            See what people are sharing.
          </p>
        </div>

        <PostComposer userName={currentUser.name} />

        <section className="mt-6 space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center">
              <div className="text-4xl">📝</div>

              <h2 className="mt-4 text-lg font-semibold">
                No posts yet
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Be the first person to share something with the
                Nexus community.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
              />
            ))
          )}
        </section>
      </div>
    </main>
  );
}
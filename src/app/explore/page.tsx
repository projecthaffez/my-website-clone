import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export default async function ExplorePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const users = await db.user.findMany({
    where: {
      id: {
        not: currentUser.id,
      },
      isBanned: false,
      isVerified: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatarUrl: true,
      isVerified: true,
    },
  });

  const posts = await db.post.findMany({
    where: {
      isDeleted: false,
      visibility: "PUBLIC",
      authorId: {
        not: currentUser.id,
      },
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
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
          >
            Nexus
          </Link>

          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Home
            </Link>

            <Link
              href={`/profile/${currentUser.username}`}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Profile
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Nexus Explore
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Discover
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Discover people and public posts from the Nexus community.
          </p>
        </div>

        {/* People */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              People to discover
            </h2>

            <span className="text-xs text-slate-500">
              {users.length} people
            </span>
          </div>

          {users.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-sm text-slate-500">
              No people to discover right now.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:border-blue-500/30 hover:bg-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-800">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-bold text-slate-400">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="truncate text-sm font-semibold">
                          {user.name}
                        </p>

                        {user.isVerified && (
                          <span className="text-xs text-blue-400">
                            ✓
                          </span>
                        )}
                      </div>

                      <p className="truncate text-xs text-slate-500">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  {user.bio && (
                    <p className="mt-4 line-clamp-2 text-xs leading-5 text-slate-400">
                      {user.bio}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Public Posts */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Public posts
            </h2>

            <span className="text-xs text-slate-500">
              Latest 20
            </span>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-sm text-slate-500">
              No public posts available yet.
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-white/10 bg-slate-900 p-5"
                >
                  <div className="flex gap-3">
                    <Link
                      href={`/profile/${post.author.username}`}
                      className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-800"
                    >
                      {post.author.avatarUrl ? (
                        <img
                          src={post.author.avatarUrl}
                          alt={post.author.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-bold text-slate-400">
                          {post.author.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${post.author.username}`}
                          className="font-semibold hover:text-blue-400"
                        >
                          {post.author.name}
                        </Link>

                        {post.author.isVerified && (
                          <span className="text-xs text-blue-400">
                            ✓
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500">
                        @{post.author.username} ·{" "}
                        {new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/posts/${post.id}`}
                    className="mt-4 block whitespace-pre-wrap break-words text-sm leading-7 text-slate-200 hover:text-white"
                  >
                    {post.content}
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
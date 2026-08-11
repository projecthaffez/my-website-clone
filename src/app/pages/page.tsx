import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CreatePageForm } from "@/components/pages/CreatePageForm";

export default async function PagesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const pages = await db.page.findMany({
    orderBy: {
      createdAt: "desc",
    },

    take: 50,

    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      description: true,
      avatarUrl: true,
      coverUrl: true,
      website: true,
      ownerId: true,
      createdAt: true,

      owner: {
        select: {
          username: true,
          name: true,
          avatarUrl: true,
        },
      },

      _count: {
        select: {
          followers: true,
          posts: true,
        },
      },

      followers: {
        where: {
          userId: currentUser.id,
        },
        select: {
          userId: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <header className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <Link
              href="/"
              className="text-xl font-bold tracking-tight"
            >
              Nexus
            </Link>

            <p className="mt-1 text-xs text-slate-500">
              Pages
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/groups"
              className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white sm:block"
            >
              Groups
            </Link>

            <Link
              href={`/profile/${currentUser.username}`}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Profile
            </Link>

            <Link
              href="/"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Page Header */}
        <section className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-400">
                Nexus Pages
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Discover Pages
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Discover businesses, brands,
                organizations, communities, and
                creators on Nexus.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400">
              {pages.length}{" "}
              {pages.length === 1
                ? "Page"
                : "Pages"}
            </div>
          </div>
        </section>

        {/* Create Page */}
        <section className="mb-10">
          <CreatePageForm />
        </section>

        {/* Pages */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold">
              All Pages
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recently created pages on Nexus.
            </p>
          </div>

          {pages.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-12 text-center">
              <div className="text-4xl">
                📄
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                No pages yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Be the first to create a page
                for your brand, business, or
                community.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {pages.map((page) => {
                const isFollowing =
                  page.followers.length > 0;

                const isOwner =
                  page.ownerId ===
                  currentUser.id;

                return (
                  <article
                    key={page.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 transition hover:border-white/20"
                  >
                    {/* Cover */}
                    <div className="relative h-32 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950">
                      {page.coverUrl && (
                        <img
                          src={page.coverUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}

                      <div className="absolute right-3 top-3">
                        {isOwner ? (
                          <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-400 backdrop-blur">
                            Your Page
                          </span>
                        ) : isFollowing ? (
                          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400 backdrop-blur">
                            Following
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="p-5">
                      {/* Identity */}
                      <div className="flex items-start gap-4">
                        <div className="-mt-12 h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-slate-900 bg-slate-800">
                          {page.avatarUrl ? (
                            <img
                              src={page.avatarUrl}
                              alt={page.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-400">
                              {page.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 pt-1">
                          <Link
                            href={`/pages/${page.slug}`}
                            className="block truncate text-lg font-bold hover:text-blue-400"
                          >
                            {page.name}
                          </Link>

                          <p className="mt-1 truncate text-sm text-blue-400">
                            {page.category}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      {page.description && (
                        <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-400">
                          {page.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="mt-5 flex flex-wrap gap-4 border-t border-white/10 pt-4 text-xs text-slate-500">
                        <span>
                          👥{" "}
                          {page._count.followers}{" "}
                          {page._count
                            .followers === 1
                            ? "follower"
                            : "followers"}
                        </span>

                        <span>
                          📝{" "}
                          {page._count.posts}{" "}
                          {page._count.posts ===
                          1
                            ? "post"
                            : "posts"}
                        </span>
                      </div>

                      {/* Owner */}
                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <span>
                          Created by
                        </span>

                        <Link
                          href={`/profile/${page.owner.username}`}
                          className="font-medium text-slate-300 hover:text-blue-400"
                        >
                          {page.owner.name}
                        </Link>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex gap-2">
                        <Link
                          href={`/pages/${page.slug}`}
                          className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-500"
                        >
                          View Page
                        </Link>

                        {page.website && (
                          <a
                            href={page.website}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                          >
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
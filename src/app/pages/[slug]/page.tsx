import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

import { PageFollowButton } from "@/components/pages/PageFollowButton";
import { PagePostComposer } from "@/components/pages/PagePostComposer";
import { EditPageForm } from "@/components/pages/EditPageForm";
import { DeletePageButton } from "@/components/pages/DeletePageButton";
import { PostCard } from "@/components/posts/PostCard";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PageProfile({
  params,
}: PageProps) {
  const currentUser =
    await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const { slug } = await params;

  const page =
    await db.page.findUnique({
      where: {
        slug,
      },

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
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
            isVerified: true,
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

        posts: {
          where: {
            isDeleted: false,
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
        },
      },
    });

  if (!page) {
    notFound();
  }

  const isOwner =
    page.ownerId === currentUser.id;

  const isFollowing =
    page.followers.length > 0;

  const formattedDate =
    new Intl.DateTimeFormat(
      "en-US",
      {
        dateStyle: "medium",
      },
    ).format(page.createdAt);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <Link
              href="/"
              className="text-xl font-bold tracking-tight"
            >
              Nexus
            </Link>

            <p className="mt-1 text-xs text-slate-500">
              Page
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/pages"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Pages
            </Link>

            <Link
              href="/groups"
              className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white sm:block"
            >
              Groups
            </Link>

            <Link
              href={`/profile/${currentUser.username}`}
              className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white sm:block"
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

      <div className="mx-auto max-w-5xl px-4 py-8">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
          <div className="relative h-52 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950">
            {page.coverUrl && (
              <img
                src={page.coverUrl}
                alt={`${page.name} cover`}
                className="h-full w-full object-cover"
              />
            )}

            {isOwner && (
              <div className="absolute right-4 top-4">
                <span className="rounded-full bg-blue-500/15 px-3 py-1.5 text-xs font-semibold text-blue-400 backdrop-blur">
                  Your Page
                </span>
              </div>
            )}
          </div>

          <div className="px-5 pb-6">
            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 items-end gap-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-slate-900 bg-slate-800">
                  {page.avatarUrl ? (
                    <img
                      src={page.avatarUrl}
                      alt={page.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-slate-400">
                      {page.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-2xl font-bold sm:text-3xl">
                      {page.name}
                    </h1>

                    {page.owner.isVerified && (
                      <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-400">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm font-medium text-blue-400">
                    {page.category}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    /{page.slug}
                  </p>
                </div>
              </div>

              {!isOwner && (
                <PageFollowButton
                  pageId={page.id}
                  initialFollowing={
                    isFollowing
                  }
                />
              )}
            </div>

            {page.description && (
              <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-400">
                {page.description}
              </p>
            )}

            {page.website && (
              <div className="mt-4">
                <a
                  href={page.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline"
                >
                  {page.website}
                </a>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-5 border-t border-white/10 pt-5 text-sm text-slate-500">
              <span>
                👥{" "}
                <strong className="text-slate-300">
                  {page._count.followers}
                </strong>{" "}
                {page._count.followers === 1
                  ? "follower"
                  : "followers"}
              </span>

              <span>
                📝{" "}
                <strong className="text-slate-300">
                  {page._count.posts}
                </strong>{" "}
                {page._count.posts === 1
                  ? "post"
                  : "posts"}
              </span>

              <span>
                Created {formattedDate}
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-800">
                {page.owner.avatarUrl ? (
                  <img
                    src={page.owner.avatarUrl}
                    alt={page.owner.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
                    {page.owner.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>

              <div className="text-sm">
                <span className="text-slate-500">
                  Managed by{" "}
                </span>

                <Link
                  href={`/profile/${page.owner.username}`}
                  className="font-semibold text-slate-300 hover:text-blue-400"
                >
                  {page.owner.name}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {isOwner && (
          <section className="mt-6">
            <EditPageForm
              pageId={page.id}
              initialName={page.name}
              initialCategory={
                page.category
              }
              initialDescription={
                page.description ?? ""
              }
              initialWebsite={
                page.website ?? ""
              }
            />

            <DeletePageButton
              pageId={page.id}
              pageName={page.name}
            />
          </section>
        )}

        {isOwner && (
          <section className="mt-6">
            <PagePostComposer
              pageId={page.id}
              pageName={page.name}
            />
          </section>
        )}

        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold">
              Page Posts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest posts published by this
              page.
            </p>
          </div>

          {page.posts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center">
              <div className="text-4xl">
                📝
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                No posts yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {isOwner
                  ? "Create the first post for your page."
                  : "This page hasn't published any posts yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {page.posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
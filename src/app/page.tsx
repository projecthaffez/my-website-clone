import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PostComposer } from "@/components/posts/PostComposer";
import { PostCard } from "@/components/posts/PostCard";
import { SearchBar } from "@/components/search/SearchBar";

export default async function HomePage() {
  const currentUser = await getCurrentUser();

  // Logged-out users see the Nexus landing page
  if (!currentUser) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <section className="flex min-h-screen items-center justify-center px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
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

  /*
   * Build the user's social graph.
   *
   * Following:
   * Users whose public posts should appear in the feed.
   *
   * Friends:
   * Accepted friendships whose FRIENDS-only posts
   * should be visible.
   */
  const [following, friendships, blockedRelationships] =
    await Promise.all([
      db.follow.findMany({
        where: {
          followerId: currentUser.id,
        },
        select: {
          followingId: true,
        },
      }),

      db.friendship.findMany({
        where: {
          status: "ACCEPTED",
          OR: [
            {
              requesterId: currentUser.id,
            },
            {
              addresseeId: currentUser.id,
            },
          ],
        },
        select: {
          requesterId: true,
          addresseeId: true,
        },
      }),

      db.friendship.findMany({
        where: {
          status: "BLOCKED",
          OR: [
            {
              requesterId: currentUser.id,
            },
            {
              addresseeId: currentUser.id,
            },
          ],
        },
        select: {
          requesterId: true,
          addresseeId: true,
        },
      }),
    ]);

  const followingIds = following.map(
    (item) => item.followingId,
  );

  const friendIds = friendships.map((friendship) =>
    friendship.requesterId === currentUser.id
      ? friendship.addresseeId
      : friendship.requesterId,
  );

  const blockedUserIds = blockedRelationships.map(
    (relationship) =>
      relationship.requesterId === currentUser.id
        ? relationship.addresseeId
        : relationship.requesterId,
  );

  /*
   * Feed authors:
   *
   * - current user
   * - people the current user follows
   * - accepted friends
   */
  const feedAuthorIds = Array.from(
    new Set([
      currentUser.id,
      ...followingIds,
      ...friendIds,
    ]),
  ).filter(
    (userId) => !blockedUserIds.includes(userId),
  );

  /*
   * Post visibility:
   *
   * PUBLIC:
   * Everyone in the feed graph can see it.
   *
   * FRIENDS:
   * Only accepted friends can see it.
   *
   * PRIVATE:
   * Only the author can see it.
   */
  const posts = await db.post.findMany({
    where: {
      isDeleted: false,

      authorId: {
        in: feedAuthorIds,
      },

      OR: [
        {
          visibility: "PUBLIC",
        },
        {
          visibility: "FRIENDS",
          authorId: {
            in: friendIds,
          },
        },
        {
          visibility: "PRIVATE",
          authorId: currentUser.id,
        },
      ],
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
      <header className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link
            href="/"
            className="shrink-0 text-xl font-bold tracking-tight"
          >
            Nexus
          </Link>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
            <SearchBar />

            <Link
              href={`/profile/${currentUser.username}`}
              className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Profile
            </Link>

            <Link
              href="/friends/requests"
              className="hidden shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 sm:block"
            >
              Requests
            </Link>

            <Link
              href="/friends"
              className="hidden shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 sm:block"
            >
              Friends
            </Link>

            <Link
              href="/messages"
              className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Messages
            </Link>

            <Link
              href="/notifications"
              className="hidden shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 sm:block"
            >
              Notifications
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
            See what your friends and connections are sharing.
          </p>
        </div>

        <PostComposer userName={currentUser.name} />

        <section className="mt-6 space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center">
              <div className="text-4xl">📝</div>

              <h2 className="mt-4 text-lg font-semibold">
                Your feed is empty
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Follow people or add friends to see their posts here.
              </p>

              <div className="mt-6 flex justify-center gap-3">
                <Link
                  href="/friends"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-500"
                >
                  Find Friends
                </Link>

                <Link
                  href={`/profile/${currentUser.username}`}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10"
                >
                  My Profile
                </Link>
              </div>
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

        {posts.length === 20 && (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs text-slate-500">
            Showing the latest 20 posts from your network.
          </div>
        )}
      </div>
    </main>
  );
}
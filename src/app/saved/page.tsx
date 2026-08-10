import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { LikeButton } from "@/components/posts/LikeButton";
import { SaveButton } from "@/components/posts/SaveButton";

export default async function SavedPostsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const savedPosts = await db.savedPost.findMany({
    where: {
      userId: currentUser.id,
      post: {
        isDeleted: false,
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    select: {
      post: {
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

  const posts = await Promise.all(
    savedPosts.map(async ({ post }) => {
      const [likeCount, reaction] =
        await Promise.all([
          db.reaction.count({
            where: {
              postId: post.id,
              type: "LIKE",
            },
          }),

          db.reaction.findUnique({
            where: {
              userId_postId: {
                userId: currentUser.id,
                postId: post.id,
              },
            },
            select: {
              type: true,
            },
          }),
        ]);

      return {
        ...post,
        likeCount,
        liked:
          reaction?.type === "LIKE",
      };
    }),
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <Link
              href="/"
              className="text-xl font-bold tracking-tight"
            >
              Nexus
            </Link>

            <p className="mt-1 text-xs text-slate-500">
              Your saved posts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Home
            </Link>

            <Link
              href={`/profile/${currentUser.username}`}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Saved Posts
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Posts you saved for later.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center">
            <div className="text-4xl">
              🔖
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              No saved posts
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              When you save a post, it will appear
              here so you can easily find it later.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-500"
            >
              Explore Posts
            </Link>
          </div>
        ) : (
          <section className="space-y-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-white/10 bg-slate-900 p-5"
              >
                {/* Author */}
                <div className="flex gap-3">
                  <Link
                    href={`/profile/${post.author.username}`}
                    className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-slate-800"
                  >
                    {post.author.avatarUrl ? (
                      <img
                        src={post.author.avatarUrl}
                        alt={post.author.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-slate-400">
                        {post.author.name
                          .charAt(0)
                          .toUpperCase()}
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

                    <div className="flex gap-2 text-xs text-slate-500">
                      <span>
                        @{post.author.username}
                      </span>

                      <span>•</span>

                      <span>
                        {new Intl.DateTimeFormat(
                          "en-US",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          },
                        ).format(post.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-slate-200">
                  {post.content}
                </div>

                {/* Actions */}
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                  <LikeButton
                    postId={post.id}
                    initialLiked={post.liked}
                    initialCount={post.likeCount}
                  />

                  <SaveButton
                    postId={post.id}
                    initialSaved={true}
                  />
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
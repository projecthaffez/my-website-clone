import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PostCard } from "@/components/posts/PostCard";
import { CommentForm } from "@/components/posts/CommentForm";
import { ReplyButton } from "@/components/posts/ReplyButton";
import { DeleteCommentButton } from "@/components/posts/DeleteCommentButton";
import { CommentLikeButton } from "@/components/posts/CommentLikeButton";

interface PostDetailPageProps {
  params: Promise<{
    postId: string;
  }>;
}

export default async function PostDetailPage({
  params,
}: PostDetailPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const { postId } = await params;

  const post = await db.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      isDeleted: true,
      isPinned: true,

      media: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          url: true,
          type: true,
          aspectRatio: true,
        },
      },

      author: {
        select: {
          username: true,
          name: true,
          avatarUrl: true,
          isVerified: true,
        },
      },

      reactions: {
        where: {
          userId: currentUser.id,
        },
        select: {
          id: true,
        },
      },

      savedBy: {
        where: {
          userId: currentUser.id,
        },
        select: {
          userId: true,
        },
      },

      comments: {
        where: {
          parentId: null,
          isDeleted: false,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          authorId: true,
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

          reactions: {
            select: {
              id: true,
              userId: true,
            },
          },

          replies: {
            where: {
              isDeleted: false,
            },
            orderBy: {
              createdAt: "asc",
            },
            select: {
              id: true,
              authorId: true,
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

              reactions: {
                select: {
                  id: true,
                  userId: true,
                },
              },
            },
          },
        },
      },

      _count: {
        select: {
          reactions: true,
          comments: true,
        },
      },
    },
  });

  if (!post || post.isDeleted) {
    notFound();
  }

  function formatCommentDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  }

  function getInitial(name: string) {
    return name.charAt(0).toUpperCase();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            Back to Feed
          </Link>

          <div>
            <h1 className="font-semibold">Post</h1>

            <p className="text-xs text-slate-500">
              Post by {post.author.name}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <PostCard
          post={{
            id: post.id,
            content: post.content,
            createdAt: post.createdAt,
            media: post.media,
            author: post.author,
            isPinned: post.isPinned,
            isLiked: post.reactions.length > 0,
            isSaved: post.savedBy.length > 0,
            reactionCount: post._count.reactions,
            commentCount: post._count.comments,
          }}
        />

        <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-base font-semibold text-white">
              Comments
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {post._count.comments}{" "}
              {post._count.comments === 1
                ? "comment"
                : "comments"}
            </p>
          </div>

          <div className="px-5">
            <CommentForm postId={post.id} />
          </div>

          <div className="border-t border-white/10">
            {post.comments.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-medium text-slate-300">
                  No comments yet
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Be the first to comment on this post.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {post.comments.map((comment) => {
                  const commentLiked =
                    comment.reactions.some(
                      (reaction) =>
                        reaction.userId === currentUser.id,
                    );

                  return (
                    <div
                      key={comment.id}
                      className="px-5 py-5"
                    >
                      <div className="flex gap-3">
                        <Link
                          href={`/profile/${comment.author.username}`}
                          className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-800"
                        >
                          {comment.author.avatarUrl ? (
                            <img
                              src={comment.author.avatarUrl}
                              alt={comment.author.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
                              {getInitial(
                                comment.author.name,
                              )}
                            </div>
                          )}
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="rounded-2xl bg-slate-950 px-4 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                href={`/profile/${comment.author.username}`}
                                className="text-sm font-semibold text-slate-200 hover:text-blue-400"
                              >
                                {comment.author.name}
                              </Link>

                              {comment.author.isVerified && (
                                <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                  ✓
                                </span>
                              )}

                              <span className="text-[11px] text-slate-600">
                                @{comment.author.username}
                              </span>
                            </div>

                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                              {comment.content}
                            </p>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-3 px-2">
                            <time className="text-[11px] text-slate-600">
                              {formatCommentDate(
                                comment.createdAt,
                              )}
                            </time>

                            <CommentLikeButton
                              commentId={comment.id}
                              initialLiked={commentLiked}
                              initialCount={
                                comment.reactions.length
                              }
                            />

                            <ReplyButton
                              postId={post.id}
                              commentId={comment.id}
                            />

                            {comment.authorId ===
                              currentUser.id && (
                              <DeleteCommentButton
                                commentId={comment.id}
                              />
                            )}
                          </div>

                          {comment.replies.length > 0 && (
                            <div className="mt-4 ml-5 space-y-3 border-l border-white/10 pl-4">
                              {comment.replies.map(
                                (reply) => {
                                  const replyLiked =
                                    reply.reactions.some(
                                      (reaction) =>
                                        reaction.userId ===
                                        currentUser.id,
                                    );

                                  return (
                                    <div
                                      key={reply.id}
                                      className="flex gap-3"
                                    >
                                      <Link
                                        href={`/profile/${reply.author.username}`}
                                        className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-800"
                                      >
                                        {reply.author
                                          .avatarUrl ? (
                                          <img
                                            src={
                                              reply.author
                                                .avatarUrl
                                            }
                                            alt={
                                              reply.author.name
                                            }
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-400">
                                            {getInitial(
                                              reply.author
                                                .name,
                                            )}
                                          </div>
                                        )}
                                      </Link>

                                      <div className="min-w-0 flex-1">
                                        <div className="rounded-2xl bg-slate-950 px-4 py-3">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <Link
                                              href={`/profile/${reply.author.username}`}
                                              className="text-sm font-semibold text-slate-200 hover:text-blue-400"
                                            >
                                              {
                                                reply.author
                                                  .name
                                              }
                                            </Link>

                                            {reply.author
                                              .isVerified && (
                                              <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                                ✓
                                              </span>
                                            )}

                                            <span className="text-[11px] text-slate-600">
                                              @
                                              {
                                                reply.author
                                                  .username
                                              }
                                            </span>
                                          </div>

                                          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                                            {reply.content}
                                          </p>
                                        </div>

                                        <div className="mt-2 flex flex-wrap items-center gap-3 px-2">
                                          <time className="text-[11px] text-slate-600">
                                            {formatCommentDate(
                                              reply.createdAt,
                                            )}
                                          </time>

                                          <CommentLikeButton
                                            commentId={
                                              reply.id
                                            }
                                            initialLiked={
                                              replyLiked
                                            }
                                            initialCount={
                                              reply.reactions
                                                .length
                                            }
                                          />

                                          {reply.authorId ===
                                            currentUser.id && (
                                            <DeleteCommentButton
                                              commentId={
                                                reply.id
                                              }
                                            />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
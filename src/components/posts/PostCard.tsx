import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { LikeButton } from "./LikeButton";
import { SaveButton } from "./SaveButton";
import { CommentForm } from "./CommentForm";
import { DeleteCommentButton } from "./DeleteCommentButton";
import { ReplyButton } from "./ReplyButton";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      username: string;
      name: string;
      avatarUrl: string | null;
      isVerified: boolean;
    };
  };
}

export async function PostCard({
  post,
}: PostCardProps) {
  const currentUser = await getCurrentUser();

  const [
    likeCount,
    currentUserReaction,
    savedPost,
    comments,
  ] = await Promise.all([
    db.reaction.count({
      where: {
        postId: post.id,
        type: "LIKE",
      },
    }),

    currentUser
      ? db.reaction.findUnique({
          where: {
            userId_postId: {
              userId: currentUser.id,
              postId: post.id,
            },
          },
          select: {
            type: true,
          },
        })
      : null,

    currentUser
      ? db.savedPost.findUnique({
          where: {
            userId_postId: {
              userId: currentUser.id,
              postId: post.id,
            },
          },
          select: {
            userId: true,
          },
        })
      : null,

    db.comment.findMany({
      where: {
        postId: post.id,
        isDeleted: false,
        parentId: null,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 5,

      select: {
        id: true,
        content: true,
        createdAt: true,

        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
            isVerified: true,
          },
        },

        replies: {
          where: {
            isDeleted: false,
          },

          orderBy: {
            createdAt: "asc",
          },

          take: 5,

          select: {
            id: true,
            content: true,
            createdAt: true,

            author: {
              select: {
                id: true,
                username: true,
                name: true,
                avatarUrl: true,
                isVerified: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const commentCount = await db.comment.count({
    where: {
      postId: post.id,
      isDeleted: false,
    },
  });

  const formattedDate =
    new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(post.createdAt);

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900 p-5">
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

            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-slate-200">
        {post.content}
      </div>

      {/* Post Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
        {/* Like */}
        {currentUser ? (
          <LikeButton
            postId={post.id}
            initialLiked={
              currentUserReaction?.type ===
              "LIKE"
            }
            initialCount={likeCount}
          />
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
          >
            ♡ {likeCount}{" "}
            {likeCount === 1
              ? "Like"
              : "Likes"}
          </Link>
        )}

        {/* Save */}
        {currentUser ? (
          <SaveButton
            postId={post.id}
            initialSaved={Boolean(savedPost)}
          />
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
          >
            🔖 Save
          </Link>
        )}
      </div>

      {/* Comments */}
      <div className="mt-4 border-t border-white/10 pt-4">
        <div className="mb-3 text-sm font-semibold text-slate-300">
          {commentCount}{" "}
          {commentCount === 1
            ? "Comment"
            : "Comments"}
        </div>

        {comments.length > 0 && (
          <div className="space-y-3">
            {comments.map((comment) => {
              const commentDate =
                new Intl.DateTimeFormat(
                  "en-US",
                  {
                    dateStyle: "medium",
                    timeStyle: "short",
                  },
                ).format(comment.createdAt);

              return (
                <div
                  key={comment.id}
                  className="rounded-xl bg-slate-950/70 p-3"
                >
                  {/* Comment */}
                  <div className="flex gap-3">
                    <Link
                      href={`/profile/${comment.author.username}`}
                      className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-800"
                    >
                      {comment.author.avatarUrl ? (
                        <img
                          src={
                            comment.author
                              .avatarUrl
                          }
                          alt={
                            comment.author.name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
                          {comment.author.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/profile/${comment.author.username}`}
                          className="text-sm font-semibold hover:text-blue-400"
                        >
                          {comment.author.name}
                        </Link>

                        {comment.author
                          .isVerified && (
                          <span className="text-xs text-blue-400">
                            ✓
                          </span>
                        )}

                        <span className="text-xs text-slate-600">
                          @
                          {
                            comment.author
                              .username
                          }
                        </span>
                      </div>

                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-300">
                        {comment.content}
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {commentDate}
                      </p>

                      {/* Comment Actions */}
                      <div className="mt-2 flex items-center gap-3">
                        {currentUser && (
                          <ReplyButton
                            postId={post.id}
                            commentId={comment.id}
                          />
                        )}

                        {currentUser?.id ===
                          comment.author.id && (
                          <DeleteCommentButton
                            commentId={comment.id}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  {comment.replies.length >
                    0 && (
                    <div className="ml-12 mt-3 space-y-3 border-l border-white/10 pl-4">
                      {comment.replies.map(
                        (reply) => {
                          const replyDate =
                            new Intl.DateTimeFormat(
                              "en-US",
                              {
                                dateStyle:
                                  "medium",
                                timeStyle:
                                  "short",
                              },
                            ).format(
                              reply.createdAt,
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
                                      reply
                                        .author
                                        .avatarUrl
                                    }
                                    alt={
                                      reply
                                        .author
                                        .name
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
                                    {reply.author
                                      .name
                                      .charAt(
                                        0,
                                      )
                                      .toUpperCase()}
                                  </div>
                                )}
                              </Link>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Link
                                    href={`/profile/${reply.author.username}`}
                                    className="text-sm font-semibold hover:text-blue-400"
                                  >
                                    {
                                      reply
                                        .author
                                        .name
                                    }
                                  </Link>

                                  {reply.author
                                    .isVerified && (
                                    <span className="text-xs text-blue-400">
                                      ✓
                                    </span>
                                  )}

                                  <span className="text-xs text-slate-600">
                                    @
                                    {
                                      reply
                                        .author
                                        .username
                                    }
                                  </span>
                                </div>

                                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-300">
                                  {
                                    reply.content
                                  }
                                </p>

                                <p className="mt-1 text-xs text-slate-600">
                                  {replyDate}
                                </p>

                                {currentUser?.id ===
                                  reply.author
                                    .id && (
                                  <DeleteCommentButton
                                    commentId={
                                      reply.id
                                    }
                                  />
                                )}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {commentCount > 5 && (
          <p className="mt-3 text-xs text-slate-500">
            Showing the latest 5 comments.
          </p>
        )}

        {/* New Comment */}
        {currentUser ? (
          <CommentForm
            postId={post.id}
          />
        ) : (
          <Link
            href="/login"
            className="mt-4 block rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-center text-sm text-slate-400 hover:bg-white/5 hover:text-white"
          >
            Log in to comment
          </Link>
        )}
      </div>
    </article>
  );
}
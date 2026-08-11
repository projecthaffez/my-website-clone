"use client";

import Link from "next/link";
import { useState } from "react";
import {
  deletePostAction,
  togglePinPostAction,
} from "@/actions/post";
import { ReportButton } from "@/components/reports/ReportButton";
import { CommentForm } from "./CommentForm";
import { LikeButton } from "./LikeButton";
import { SaveButton } from "./SaveButton";
import { ShareButton } from "./ShareButton";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    createdAt: Date;

    media: {
      id: string;
      url: string;
      type: "IMAGE" | "VIDEO" | "DOCUMENT";
      aspectRatio: number | null;
    }[];

    author: {
      username: string;
      name: string;
      avatarUrl: string | null;
      isVerified: boolean;
    };

    isLiked?: boolean;
    isSaved?: boolean;
    isPinned?: boolean;
    reactionCount?: number;
    commentCount?: number;
    shareCount?: number;
  };
}

function formatPostDate(date: Date) {
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

export function PostCard({
  post,
}: PostCardProps) {
  const [deleted, setDeleted] = useState(false);

  const [pinned, setPinned] = useState(
    Boolean(post.isPinned),
  );

  const [deleting, setDeleting] = useState(false);
  const [pinning, setPinning] = useState(false);

  const [deleteError, setDeleteError] = useState("");
  const [pinError, setPinError] = useState("");

  async function handleDelete() {
    if (deleting) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this post?",
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setDeleteError("");

    const result = await deletePostAction(post.id);

    if (!result.success) {
      setDeleteError(result.error);
      setDeleting(false);
      return;
    }

    setDeleted(true);
    setDeleting(false);
  }

  async function handlePin() {
    if (pinning) {
      return;
    }

    setPinning(true);
    setPinError("");

    const result = await togglePinPostAction(post.id);

    if (!result.success) {
      setPinError(result.error);
      setPinning(false);
      return;
    }

    setPinned(result.pinned);
    setPinning(false);
  }

  if (deleted) {
    return null;
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
      {/* Header */}
      <div className="flex items-start gap-3 px-5 py-4">
        {/* Avatar */}
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
              {getInitial(post.author.name)}
            </div>
          )}
        </Link>

        {/* Author */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/profile/${post.author.username}`}
              className="font-semibold text-slate-100 hover:text-blue-400"
            >
              {post.author.name}
            </Link>

            {post.author.isVerified && (
              <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                ✓
              </span>
            )}

            {pinned && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                Pinned
              </span>
            )}
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>@{post.author.username}</span>

            <span>•</span>

            {/* Post Detail Link */}
            <Link
              href={`/posts/${post.id}`}
              className="text-slate-500 transition hover:text-blue-400"
              title="Open post"
            >
              <time
                dateTime={new Date(
                  post.createdAt,
                ).toISOString()}
              >
                {formatPostDate(post.createdAt)}
              </time>
            </Link>
          </div>
        </div>

        {/* Post Menu */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handlePin}
            disabled={pinning}
            title={
              pinned
                ? "Unpin post"
                : "Pin post"
            }
            className="rounded-lg px-2 py-1.5 text-xs text-slate-500 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            {pinning
              ? "..."
              : pinned
                ? "Unpin"
                : "Pin"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            title="Delete post"
            className="rounded-lg px-2 py-1.5 text-xs text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
          >
            {deleting ? "..." : "Delete"}
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="mx-5 mb-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {deleteError}
        </div>
      )}

      {pinError && (
        <div className="mx-5 mb-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {pinError}
        </div>
      )}

      {/* Content */}
      {post.content && (
        <div className="px-5 pb-2">
          <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-200">
            {post.content}
          </p>
        </div>
      )}

      {/* Media */}
      {post.media.length > 0 && (
        <div
          className={`mt-4 grid gap-2 px-5 ${
            post.media.length === 1
              ? "grid-cols-1"
              : "grid-cols-2"
          }`}
        >
          {post.media.map((media) => {
            if (media.type === "IMAGE") {
              return (
                <div
                  key={media.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-950"
                >
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={media.url}
                      alt="Post media"
                      loading="lazy"
                      className="max-h-[650px] w-full object-cover transition duration-300 group-hover:scale-[1.01]"
                      style={
                        media.aspectRatio
                          ? {
                              aspectRatio:
                                media.aspectRatio,
                            }
                          : undefined
                      }
                    />
                  </a>
                </div>
              );
            }

            if (media.type === "VIDEO") {
              return (
                <div
                  key={media.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-black"
                >
                  <video
                    src={media.url}
                    controls
                    preload="metadata"
                    playsInline
                    className="max-h-[650px] w-full"
                    style={
                      media.aspectRatio
                        ? {
                            aspectRatio:
                              media.aspectRatio,
                          }
                        : undefined
                    }
                  />
                </div>
              );
            }

            return (
              <a
                key={media.id}
                href={media.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-28 items-center gap-4 rounded-2xl border border-white/10 bg-slate-950 p-5 transition hover:border-white/20 hover:bg-white/5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
                  📄
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-slate-200">
                    Document
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Click to open document
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 border-t border-white/10 px-5 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <LikeButton
            postId={post.id}
            initialLiked={Boolean(post.isLiked)}
            initialCount={
              post.reactionCount ?? 0
            }
          />

          <SaveButton
            postId={post.id}
            initialSaved={Boolean(post.isSaved)}
          />

          <ShareButton postId={post.id} />

          <ReportButton
            targetType="POST"
            targetId={post.id}
          />
        </div>
      </div>

      {/* Comments */}
      <div className="border-t border-white/10 px-5 py-4">
        <CommentForm postId={post.id} />
      </div>
    </article>
  );
}
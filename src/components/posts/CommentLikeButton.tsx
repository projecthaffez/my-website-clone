"use client";

import { useState, useTransition } from "react";
import { toggleCommentLikeAction } from "@/actions/reaction";

interface CommentLikeButtonProps {
  commentId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function CommentLikeButton({
  commentId,
  initialLiked,
  initialCount,
}: CommentLikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleLike() {
    if (isPending) {
      return;
    }

    const previousLiked = liked;
    const previousCount = count;
    const nextLiked = !liked;

    setLiked(nextLiked);
    setCount(
      nextLiked
        ? count + 1
        : Math.max(0, count - 1),
    );

    startTransition(async () => {
      const result =
        await toggleCommentLikeAction(commentId);

      if (!result.success) {
        setLiked(previousLiked);
        setCount(previousCount);
        return;
      }

      setLiked(result.liked);
      setCount(result.count);
    });
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={isPending}
      aria-pressed={liked}
      aria-label={
        liked
          ? "Unlike this comment"
          : "Like this comment"
      }
      className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition ${
        liked
          ? "bg-blue-500/15 text-blue-400"
          : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span className="text-sm">
        {liked ? "♥" : "♡"}
      </span>

      <span>
        {count} {count === 1 ? "Like" : "Likes"}
      </span>
    </button>
  );
}
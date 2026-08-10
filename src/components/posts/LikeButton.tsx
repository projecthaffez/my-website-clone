"use client";

import { useState, useTransition } from "react";
import { togglePostLikeAction } from "@/actions/reaction";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleLike() {
    const previousLiked = liked;
    const previousCount = count;

    const nextLiked = !liked;

    // Optimistic UI update
    setLiked(nextLiked);
    setCount(
      nextLiked
        ? count + 1
        : Math.max(0, count - 1),
    );

    startTransition(async () => {
      const result = await togglePostLikeAction(postId);

      if (!result.success) {
        setLiked(previousLiked);
        setCount(previousCount);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={isPending}
      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
        liked
          ? "bg-blue-500/15 text-blue-400"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span className="text-lg">
        {liked ? "♥" : "♡"}
      </span>

      <span>
        {count} {count === 1 ? "Like" : "Likes"}
      </span>
    </button>
  );
}
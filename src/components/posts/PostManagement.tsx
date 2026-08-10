"use client";

import { useState, useTransition } from "react";
import {
  deletePostAction,
  togglePinPostAction,
} from "@/actions/post";

interface PostManagementProps {
  postId: string;
  initialPinned: boolean;
}

export function PostManagement({
  postId,
  initialPinned,
}: PostManagementProps) {
  const [pinned, setPinned] =
    useState(initialPinned);

  const [isPending, startTransition] =
    useTransition();

  const [error, setError] = useState("");

  function handlePin() {
    if (isPending) {
      return;
    }

    setError("");

    const previousPinned = pinned;
    const nextPinned = !pinned;

    setPinned(nextPinned);

    startTransition(async () => {
      const result =
        await togglePinPostAction(postId);

      if (!result.success) {
        setPinned(previousPinned);
        setError(result.error);
        return;
      }

      setPinned(result.pinned);
    });
  }

  function handleDelete() {
    if (isPending) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this post?",
    );

    if (!confirmed) {
      return;
    }

    setError("");

    startTransition(async () => {
      const result =
        await deletePostAction(postId);

      if (!result.success) {
        setError(result.error);
        return;
      }

      /*
       * Refresh the current Server Component
       * after successful deletion.
       */
      window.location.reload();
    });
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handlePin}
        disabled={isPending}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
          pinned
            ? "bg-blue-500/15 text-blue-400"
            : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {pinned ? "📌 Pinned" : "📌 Pin"}
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Processing..."
          : "Delete"}
      </button>

      {error && (
        <span className="text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}
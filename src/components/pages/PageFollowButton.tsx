"use client";

import { useState } from "react";
import { togglePageFollowAction } from "@/actions/page";

interface PageFollowButtonProps {
  pageId: string;
  initialFollowing: boolean;
}

export function PageFollowButton({
  pageId,
  initialFollowing,
}: PageFollowButtonProps) {
  const [following, setFollowing] =
    useState(initialFollowing);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleToggle() {
    if (loading) {
      return;
    }

    setError("");
    setLoading(true);

    const previousFollowing =
      following;

    setFollowing(!previousFollowing);

    try {
      const result =
        await togglePageFollowAction(
          pageId,
        );

      if (!result.success) {
        setFollowing(
          previousFollowing,
        );

        setError(result.error);
        return;
      }

      setFollowing(
        result.following,
      );
    } catch (error) {
      console.error(
        "PageFollowButton failed:",
        error,
      );

      setFollowing(
        previousFollowing,
      );

      setError(
        "Failed to update follow status.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
          following
            ? "border border-white/10 bg-white/5 text-slate-300 hover:bg-red-500/10 hover:text-red-400"
            : "bg-blue-600 text-white hover:bg-blue-500"
        }`}
      >
        {loading
          ? "Updating..."
          : following
            ? "Following"
            : "Follow"}
      </button>

      {error && (
        <p className="max-w-xs text-right text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
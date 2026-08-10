"use client";

import { useState } from "react";
import { followUserAction, unfollowUserAction } from "@/actions/social";

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing: boolean;
}

export function FollowButton({
  targetUserId,
  initialFollowing,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    if (loading) return;

    setLoading(true);
    setError("");

    const result = following
      ? await unfollowUserAction(targetUserId)
      : await followUserAction(targetUserId);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setFollowing(!following);
    setLoading(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={
          following
            ? "rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
            : "rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {loading
          ? "Please wait..."
          : following
            ? "Following"
            : "Follow"}
      </button>

      {error && (
        <p className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
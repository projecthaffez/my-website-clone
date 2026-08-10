"use client";

import { useState } from "react";
import {
  blockUserAction,
  unblockUserAction,
} from "@/actions/friendship";

interface BlockButtonProps {
  targetUserId: string;
  initialBlocked: boolean;
}

export function BlockButton({
  targetUserId,
  initialBlocked,
}: BlockButtonProps) {
  const [blocked, setBlocked] = useState(initialBlocked);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    if (loading) return;

    setLoading(true);
    setError("");

    const result = blocked
      ? await unblockUserAction(targetUserId)
      : await blockUserAction(targetUserId);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setBlocked(!blocked);
    setLoading(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={
          blocked
            ? "rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            : "rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {loading
          ? "Please wait..."
          : blocked
            ? "Unblock"
            : "Block"}
      </button>

      {error && (
        <p className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
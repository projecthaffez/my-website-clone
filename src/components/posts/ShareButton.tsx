"use client";

import { useState } from "react";

interface ShareButtonProps {
  postId: string;
}

export function ShareButton({
  postId,
}: ShareButtonProps) {
  const [shared, setShared] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleShare() {
    if (loading) {
      return;
    }

    setLoading(true);
    setShared(false);

    try {
      const url = `${window.location.origin}/?post=${postId}`;

      if (
        typeof navigator !== "undefined" &&
        navigator.share
      ) {
        await navigator.share({
          title: "Nexus Post",
          text: "Check out this post on Nexus.",
          url,
        });

        setShared(true);
      } else {
        await navigator.clipboard.writeText(url);

        setShared(true);
      }
    } catch (error) {
      /*
       * AbortError means the user cancelled
       * the native share dialog.
       */
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      console.error(
        "Share failed:",
        error,
      );
    } finally {
      setLoading(false);

      setTimeout(() => {
        setShared(false);
      }, 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={loading}
      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
        shared
          ? "bg-emerald-500/15 text-emerald-400"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span>
        {shared ? "✓" : "↗"}
      </span>

      <span>
        {loading
          ? "Sharing..."
          : shared
            ? "Copied"
            : "Share"}
      </span>
    </button>
  );
}
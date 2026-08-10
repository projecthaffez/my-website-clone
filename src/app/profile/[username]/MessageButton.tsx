"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createConversationAction } from "@/actions/message";

interface MessageButtonProps {
  targetUserId: string;
  disabled?: boolean;
}

export function MessageButton({
  targetUserId,
  disabled = false,
}: MessageButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleMessage() {
    if (loading || disabled) {
      return;
    }

    setLoading(true);
    setError("");

    const result =
      await createConversationAction(targetUserId);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(
      `/messages/${result.conversationId}`,
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleMessage}
        disabled={loading || disabled}
        className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-2.5 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Opening..." : "Message"}
      </button>

      {error && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-red-500/20 bg-slate-900 px-3 py-2 text-xs text-red-300 shadow-xl">
          {error}
        </div>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMessageAction } from "@/actions/message";

interface DeleteMessageButtonProps {
  messageId: string;
}

export function DeleteMessageButton({
  messageId,
}: DeleteMessageButtonProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?",
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const result =
        await deleteMessageAction(messageId);

      if (!result.success) {
        window.alert(result.error);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Delete message failed:",
        error,
      );

      window.alert(
        "Failed to delete message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      title="Delete message"
      aria-label="Delete message"
      className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs text-slate-500 opacity-0 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "..." : "Delete"}
    </button>
  );
}
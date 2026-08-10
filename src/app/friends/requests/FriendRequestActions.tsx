"use client";

import { useState } from "react";
import {
  acceptFriendRequestAction,
  rejectFriendRequestAction,
} from "@/actions/friendship";

interface FriendRequestActionsProps {
  requestId: string;
}

export function FriendRequestActions({
  requestId,
}: FriendRequestActionsProps) {
  const [loading, setLoading] = useState<
    "accept" | "reject" | null
  >(null);

  const [error, setError] = useState("");

  async function accept() {
    setLoading("accept");
    setError("");

    const result = await acceptFriendRequestAction(requestId);

    if (!result.success) {
      setError(result.error);
      setLoading(null);
      return;
    }

    window.location.reload();
  }

  async function reject() {
    setLoading("reject");
    setError("");

    const result = await rejectFriendRequestAction(requestId);

    if (!result.success) {
      setError(result.error);
      setLoading(null);
      return;
    }

    window.location.reload();
  }

  return (
    <div className="flex shrink-0 flex-col gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={accept}
          disabled={loading !== null}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === "accept" ? "Accepting..." : "Accept"}
        </button>

        <button
          type="button"
          onClick={reject}
          disabled={loading !== null}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === "reject" ? "Rejecting..." : "Reject"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import {
  sendFriendRequestAction,
  cancelFriendRequestAction,
  removeFriendAction,
} from "@/actions/friendship";

type RequestState =
  | "NONE"
  | "PENDING_SENT"
  | "PENDING_RECEIVED"
  | "ACCEPTED";

interface FriendRequestButtonProps {
  targetUserId: string;
  initialState: RequestState;
  initialRequestId?: string | null;
}

export function FriendRequestButton({
  targetUserId,
  initialState,
  initialRequestId = null,
}: FriendRequestButtonProps) {
  const [state, setState] = useState<RequestState>(initialState);
  const [requestId, setRequestId] = useState<string | null>(
    initialRequestId,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendRequest() {
    setLoading(true);
    setError("");

    const result = await sendFriendRequestAction(targetUserId);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setState("PENDING_SENT");
    setLoading(false);
  }

  async function cancelRequest() {
    setLoading(true);
    setError("");

    const result = await cancelFriendRequestAction(targetUserId);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setState("NONE");
    setRequestId(null);
    setLoading(false);
  }

  async function removeFriend() {
    setLoading(true);
    setError("");

    const result = await removeFriendAction(targetUserId);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setState("NONE");
    setLoading(false);
  }

  if (state === "PENDING_RECEIVED") {
    return (
      <div className="flex flex-col gap-2">
        <span className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-2.5 text-center text-sm font-semibold text-yellow-300">
          Friend Request Received
        </span>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }

  if (state === "ACCEPTED") {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={removeFriend}
          disabled={loading}
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60"
        >
          {loading ? "Removing..." : "Friends"}
        </button>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }

  if (state === "PENDING_SENT") {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={cancelRequest}
          disabled={loading}
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
        >
          {loading ? "Cancelling..." : "Request Sent"}
        </button>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={sendRequest}
        disabled={loading}
        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
      >
        {loading ? "Sending..." : "Add Friend"}
      </button>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
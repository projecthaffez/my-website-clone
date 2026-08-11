"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  joinGroupAction,
  leaveGroupAction,
} from "@/actions/group";

interface GroupMembershipButtonProps {
  groupId: string;
  isMember: boolean;
  isAdmin: boolean;
}

export function GroupMembershipButton({
  groupId,
  isMember: initialIsMember,
  isAdmin,
}: GroupMembershipButtonProps) {
  const router = useRouter();

  const [isMember, setIsMember] =
    useState(initialIsMember);

  const [error, setError] = useState("");

  const [isPending, startTransition] =
    useTransition();

  function handleJoin() {
    if (isPending) {
      return;
    }

    setError("");

    startTransition(async () => {
      const result =
        await joinGroupAction(groupId);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setIsMember(true);
      router.refresh();
    });
  }

  function handleLeave() {
    if (isPending) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to leave this group?",
    );

    if (!confirmed) {
      return;
    }

    setError("");

    startTransition(async () => {
      const result =
        await leaveGroupAction(groupId);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setIsMember(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {isMember ? (
        <button
          type="button"
          onClick={handleLeave}
          disabled={isPending || isAdmin}
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAdmin
            ? "Group Admin"
            : isPending
              ? "Leaving..."
              : "Leave Group"}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleJoin}
          disabled={isPending}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? "Joining..."
            : "Join Group"}
        </button>
      )}

      {error && (
        <p className="max-w-xs text-right text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
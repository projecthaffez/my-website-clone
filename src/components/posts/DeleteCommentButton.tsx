"use client";

import { useState, useTransition } from "react";
import { deleteCommentAction } from "@/actions/comment";

interface DeleteCommentButtonProps {
  commentId: string;
}

export function DeleteCommentButton({
  commentId,
}: DeleteCommentButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?",
    );

    if (!confirmed) {
      return;
    }

    setError("");

    startTransition(async () => {
      const result = await deleteCommentAction(commentId);

      if (!result.success) {
        setError(result.error);
        return;
      }

      window.location.reload();
    });
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs text-slate-500 transition hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>

      {error && (
        <p className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
"use client";

import { useState, useTransition } from "react";
import { deletePagePostAction } from "@/actions/pagePost";

interface PagePostManagementProps {
  postId: string;
}

export function PagePostManagement({
  postId,
}: PagePostManagementProps) {
  const [isPending, startTransition] =
    useTransition();

  const [error, setError] =
    useState("");

  function handleDelete() {
    if (isPending) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this page post?",
    );

    if (!confirmed) {
      return;
    }

    setError("");

    startTransition(async () => {
      const result =
        await deletePagePostAction(postId);

      if (!result.success) {
        setError(result.error);
        return;
      }

      window.location.reload();
    });
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Deleting..."
          : "Delete Page Post"}
      </button>

      {error && (
        <span className="text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}
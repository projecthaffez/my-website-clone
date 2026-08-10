"use client";

import { useState, useTransition } from "react";
import { createReplyAction } from "@/actions/comment";

interface ReplyFormProps {
  postId: string;
  parentId: string;
  onCancel?: () => void;
}

export function ReplyForm({
  postId,
  parentId,
  onCancel,
}: ReplyFormProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!content.trim()) {
      setError("Write a reply first.");
      return;
    }

    startTransition(async () => {
      const result = await createReplyAction(
        postId,
        parentId,
        content,
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setContent("");
      window.location.reload();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3"
    >
      <div className="flex gap-2">
        <input
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          maxLength={2000}
          disabled={isPending}
          placeholder="Write a reply..."
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={
            isPending || !content.trim()
          }
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "..." : "Reply"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </form>
  );
}
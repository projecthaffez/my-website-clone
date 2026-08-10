"use client";

import { useState, useTransition } from "react";
import { createCommentAction } from "@/actions/comment";

interface CommentFormProps {
  postId: string;
}

export function CommentForm({
  postId,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!content.trim()) {
      setError("Write a comment first.");
      return;
    }

    startTransition(async () => {
      const result = await createCommentAction(
        postId,
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
      className="mt-4"
    >
      <div className="flex gap-2">
        <input
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          maxLength={2000}
          disabled={isPending}
          placeholder="Write a comment..."
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={
            isPending || !content.trim()
          }
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "..." : "Comment"}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </form>
  );
}
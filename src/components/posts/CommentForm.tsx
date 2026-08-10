"use client";

import { FormEvent, useState } from "react";
import { createCommentAction } from "@/actions/comment";

interface CommentFormProps {
  postId: string;
}

export function CommentForm({
  postId,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const cleanContent = content.trim();

    if (!cleanContent) {
      setError("Comment cannot be empty.");
      return;
    }

    if (cleanContent.length > 2000) {
      setError(
        "Comment cannot exceed 2000 characters.",
      );
      return;
    }

    setLoading(true);

    try {
      const result = await createCommentAction(
        postId,
        cleanContent,
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setContent("");
      setSuccess(true);

      window.location.reload();
    } catch (error) {
      console.error(error);
      setError(
        "Failed to add comment. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-2"
    >
      <textarea
        value={content}
        onChange={(event) =>
          setContent(event.target.value)
        }
        placeholder="Write a comment..."
        rows={3}
        maxLength={2000}
        disabled={loading}
        className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
      />

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs">
          {error && (
            <span className="text-red-400">
              {error}
            </span>
          )}

          {success && !error && (
            <span className="text-emerald-400">
              Comment added.
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={
            loading || !content.trim()
          }
          className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Commenting..."
            : "Comment"}
        </button>
      </div>
    </form>
  );
}
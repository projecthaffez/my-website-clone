"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createCommentAction } from "@/actions/comment";

interface CommentFormProps {
  postId: string;
}

export function CommentForm({
  postId,
}: CommentFormProps) {
  const router = useRouter();

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

      /*
       * Refresh the Server Component data
       * without doing a full browser reload.
       */
      router.refresh();
    } catch (error) {
      console.error(
        "Comment submission failed:",
        error,
      );

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
      className="mt-4 space-y-3"
    >
      <textarea
        value={content}
        onChange={(event) => {
          setContent(event.target.value);

          if (error) {
            setError("");
          }

          if (success) {
            setSuccess(false);
          }
        }}
        placeholder="Write a comment..."
        rows={3}
        maxLength={2000}
        disabled={loading}
        className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="flex items-center justify-between gap-3">
        <div className="min-h-5 text-xs">
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

        <div className="flex shrink-0 items-center gap-3">
          <span className="text-xs text-slate-600">
            {content.length}/2000
          </span>

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
      </div>
    </form>
  );
}
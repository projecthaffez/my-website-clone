"use client";

import { FormEvent, useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    const cleanContent = content.trim();

    if (!cleanContent) {
      setError("Reply cannot be empty.");
      return;
    }

    if (cleanContent.length > 2000) {
      setError(
        "Reply cannot exceed 2000 characters.",
      );
      return;
    }

    setLoading(true);

    try {
      const result = await createReplyAction(
        parentId,
        cleanContent,
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setContent("");

      if (onCancel) {
        onCancel();
      }

      window.location.reload();
    } catch (error) {
      console.error(
        "Reply submission failed:",
        error,
      );

      setError(
        "Failed to add reply. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 space-y-2"
    >
      <textarea
        value={content}
        onChange={(event) =>
          setContent(event.target.value)
        }
        placeholder="Write a reply..."
        rows={2}
        maxLength={2000}
        disabled={loading}
        className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
      />

      {error && (
        <p className="text-xs text-red-400">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-white/10 px-4 py-2 text-xs text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={
            loading || !content.trim()
          }
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Replying..." : "Reply"}
        </button>
      </div>
    </form>
  );
}
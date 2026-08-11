"use client";

import { useState, useTransition } from "react";
import { editCommentAction } from "@/actions/comment";

interface EditCommentButtonProps {
  commentId: string;
  initialContent: string;
}

export function EditCommentButton({
  commentId,
  initialContent,
}: EditCommentButtonProps) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(
    initialContent,
  );
  const [error, setError] = useState("");
  const [isPending, startTransition] =
    useTransition();

  function handleCancel() {
    if (isPending) {
      return;
    }

    setContent(initialContent);
    setError("");
    setEditing(false);
  }

  function handleSave() {
    if (isPending) {
      return;
    }

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

    setError("");

    startTransition(async () => {
      const result = await editCommentAction(
        commentId,
        cleanContent,
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setContent(cleanContent);
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setError("");
          setEditing(true);
        }}
        className="text-[11px] font-medium text-slate-500 transition hover:text-blue-400"
      >
        Edit
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <textarea
        value={content}
        onChange={(event) => {
          setContent(event.target.value);

          if (error) {
            setError("");
          }
        }}
        maxLength={2000}
        rows={3}
        disabled={isPending}
        autoFocus
        className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-h-4 text-xs">
          {error && (
            <span className="text-red-400">
              {error}
            </span>
          )}

          {!error && (
            <span className="text-slate-600">
              {content.length}/2000
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={
              isPending || !content.trim()
            }
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
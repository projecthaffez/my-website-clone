"use client";

import { useState } from "react";
import { createGroupPostAction } from "@/actions/group";

interface GroupPostComposerProps {
  groupId: string;
  groupName: string;
}

export function GroupPostComposer({
  groupId,
  groupName,
}: GroupPostComposerProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    const cleanContent = content.trim();

    if (!cleanContent) {
      setError("Write something before posting.");
      return;
    }

    if (cleanContent.length > 5000) {
      setError(
        "Post cannot exceed 5000 characters.",
      );
      return;
    }

    setLoading(true);

    try {
      const result =
        await createGroupPostAction(
          groupId,
          cleanContent,
        );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setContent("");

      window.location.reload();
    } catch (error) {
      console.error(
        "GroupPostComposer failed:",
        error,
      );

      setError(
        "Failed to create post. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-slate-900 p-5"
    >
      <div className="mb-4">
        <h3 className="font-semibold">
          Create a post
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Share something with {groupName}.
        </p>
      </div>

      <textarea
        value={content}
        onChange={(event) =>
          setContent(event.target.value)
        }
        maxLength={5000}
        rows={5}
        placeholder={`Share something with ${groupName}...`}
        disabled={loading}
        className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50 disabled:opacity-60"
      />

      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-600">
          {content.length}/5000
        </span>

        <button
          type="submit"
          disabled={
            loading || !content.trim()
          }
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Posting..."
            : "Post"}
        </button>
      </div>
    </form>
  );
}
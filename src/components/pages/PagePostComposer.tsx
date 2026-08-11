"use client";

import { useState } from "react";
import { createPagePostAction } from "@/actions/pagePost";

interface PagePostComposerProps {
  pageId: string;
  pageName: string;
}

export function PagePostComposer({
  pageId,
  pageName,
}: PagePostComposerProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] =
    useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanContent =
      content.trim();

    if (!cleanContent) {
      setError(
        "Write something before posting.",
      );
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
        await createPagePostAction(
          pageId,
          cleanContent,
        );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setContent("");
      setSuccess(
        "Page post published successfully.",
      );

      window.location.reload();
    } catch (error) {
      console.error(
        "PagePostComposer failed:",
        error,
      );

      setError(
        "Failed to create page post. Please try again.",
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
        <h2 className="font-semibold text-white">
          Create a Page Post
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Publish something as {pageName}.
        </p>
      </div>

      <textarea
        value={content}
        onChange={(event) =>
          setContent(event.target.value)
        }
        maxLength={5000}
        rows={5}
        placeholder="What's happening with your page?"
        disabled={loading}
        className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 disabled:opacity-60"
      />

      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {success && !error && (
        <p className="mt-2 text-sm text-emerald-400">
          {success}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {content.length}/5000
        </span>

        <button
          type="submit"
          disabled={
            loading ||
            !content.trim()
          }
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Publishing..."
            : "Publish Post"}
        </button>
      </div>
    </form>
  );
}
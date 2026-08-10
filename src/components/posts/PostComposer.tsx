"use client";

import { useState } from "react";
import { createPostAction } from "@/actions/post";

interface PostComposerProps {
  userName: string;
}

export function PostComposer({
  userName,
}: PostComposerProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!content.trim()) {
      setError("Write something before posting.");
      return;
    }

    setLoading(true);

    const result = await createPostAction(content);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setContent("");
    setLoading(false);

    window.location.reload();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-slate-900 p-5"
    >
      <div className="mb-4">
        <h2 className="font-semibold">
          Create a post
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Share something with your network, {userName}.
        </p>
      </div>

      <textarea
        value={content}
        onChange={(event) =>
          setContent(event.target.value)
        }
        maxLength={5000}
        rows={5}
        placeholder="What's on your mind?"
        disabled={loading}
        className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 disabled:opacity-60"
      />

      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {content.length}/5000
        </span>

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}
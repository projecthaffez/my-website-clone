"use client";

import { useState, useTransition } from "react";
import { toggleSavePostAction } from "@/actions/saved";

interface SaveButtonProps {
  postId: string;
  initialSaved: boolean;
}

export function SaveButton({
  postId,
  initialSaved,
}: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (isPending) {
      return;
    }

    const previousSaved = saved;
    const nextSaved = !saved;

    // Optimistic update
    setSaved(nextSaved);

    startTransition(async () => {
      const result =
        await toggleSavePostAction(postId);

      if (!result.success) {
        setSaved(previousSaved);
        return;
      }

      setSaved(result.saved);
    });
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={isPending}
      aria-pressed={saved}
      aria-label={
        saved
          ? "Remove post from saved"
          : "Save post"
      }
      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
        saved
          ? "bg-amber-500/15 text-amber-400"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span className="text-base">
        {saved ? "🔖" : "♡"}
      </span>

      <span>
        {saved ? "Saved" : "Save"}
      </span>
    </button>
  );
}
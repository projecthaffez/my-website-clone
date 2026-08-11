"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePageAction } from "@/actions/page";

interface DeletePageButtonProps {
  pageId: string;
  pageName: string;
}

export function DeletePageButton({
  pageId,
  pageName,
}: DeletePageButtonProps) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  const [error, setError] =
    useState("");

  function handleDelete() {
    if (isPending) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to permanently delete "${pageName}"? This action cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    setError("");

    startTransition(async () => {
      const result =
        await deletePageAction(pageId);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/pages");
      router.refresh();
    });
  }

  return (
    <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
      <div>
        <h3 className="font-semibold text-red-400">
          Delete Page
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Permanently delete this page and
          its associated content. This action
          cannot be undone.
        </p>
      </div>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Deleting..."
          : "Delete Page"}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
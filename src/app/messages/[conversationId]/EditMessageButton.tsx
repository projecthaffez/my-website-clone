"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { editMessageAction } from "@/actions/message";

interface EditMessageButtonProps {
  messageId: string;
  initialContent: string;
}

export function EditMessageButton({
  messageId,
  initialContent,
}: EditMessageButtonProps) {
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);

  function handleCancel() {
    setContent(initialContent);
    setEditing(false);
  }

  async function handleSave() {
    const cleanContent = content.trim();

    if (!cleanContent) {
      window.alert("Message cannot be empty.");
      return;
    }

    if (cleanContent.length > 5000) {
      window.alert(
        "Message cannot exceed 5000 characters.",
      );
      return;
    }

    setLoading(true);

    try {
      const result = await editMessageAction(
        messageId,
        cleanContent,
      );

      if (!result.success) {
        window.alert(result.error);
        return;
      }

      setEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Edit message failed:", error);

      window.alert(
        "Failed to edit message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <div className="w-72 rounded-xl border border-white/10 bg-slate-900 p-3">
        <textarea
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          maxLength={5000}
          rows={3}
          disabled={loading}
          autoFocus
          className="w-full resize-none rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50 disabled:opacity-50"
        />

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-500">
            {content.length}/5000
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={
                loading || !content.trim()
              }
              className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title="Edit message"
      aria-label="Edit message"
      className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs text-slate-500 opacity-0 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400 group-hover:opacity-100"
    >
      Edit
    </button>
  );
}
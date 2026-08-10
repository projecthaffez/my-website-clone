"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendMessageAction } from "@/actions/message";

interface ChatFormProps {
  conversationId: string;
}

export function ChatForm({
  conversationId,
}: ChatFormProps) {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (sending) {
      return;
    }

    const cleanContent = content.trim();

    if (!cleanContent) {
      return;
    }

    setSending(true);
    setError("");

    const result = await sendMessageAction(
      conversationId,
      cleanContent,
    );

    if (!result.success) {
      setError(result.error);
      setSending(false);
      return;
    }

    setContent("");
    setSending(false);

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2"
    >
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          disabled={sending}
          maxLength={5000}
          rows={1}
          placeholder="Write a message..."
          className="max-h-32 min-h-12 flex-1 resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={
            sending || !content.trim()
          }
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>

      <div className="flex justify-between text-[11px] text-slate-600">
        <span>
          {content.length}/5000
        </span>

        <span>
          Enter to send
        </span>
      </div>
    </form>
  );
}
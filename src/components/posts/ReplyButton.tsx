"use client";

import { useState } from "react";
import { ReplyForm } from "./ReplyForm";

interface ReplyButtonProps {
  postId: string;
  commentId: string;
}

export function ReplyButton({
  postId,
  commentId,
}: ReplyButtonProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setShowForm((value) => !value)}
        className="text-xs font-medium text-slate-500 transition hover:text-blue-400"
      >
        {showForm ? "Cancel Reply" : "Reply"}
      </button>

      {showForm && (
        <ReplyForm
          postId={postId}
          parentId={commentId}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
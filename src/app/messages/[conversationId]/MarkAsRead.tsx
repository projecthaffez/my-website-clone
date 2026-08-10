"use client";

import { useEffect } from "react";
import { markConversationReadAction } from "@/actions/message";

interface MarkAsReadProps {
  conversationId: string;
}

export function MarkAsRead({
  conversationId,
}: MarkAsReadProps) {
  useEffect(() => {
    void markConversationReadAction(
      conversationId,
    );
  }, [conversationId]);

  return null;
}
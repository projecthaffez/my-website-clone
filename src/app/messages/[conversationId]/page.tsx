import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ChatForm } from "./ChatForm";
import { MarkAsRead } from "./MarkAsRead";

interface ConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { conversationId } = await params;

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const participant =
    await db.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUser.id,
        },
      },
    });

  if (!participant) {
    notFound();
  }

  const conversation =
    await db.conversation.findUnique({
      where: {
        id: conversationId,
      },
      select: {
        id: true,
        isGroup: true,
        name: true,

        participants: {
          where: {
            userId: {
              not: currentUser.id,
            },
          },
          select: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatarUrl: true,
                isVerified: true,
                isBanned: true,
              },
            },
          },
        },

        messages: {
          where: {
            isDeleted: false,
          },
          orderBy: {
            createdAt: "asc",
          },
          take: 100,
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            sender: {
              select: {
                name: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

  if (!conversation) {
    notFound();
  }

  const otherUser =
    conversation.participants[0]?.user ?? null;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <MarkAsRead
        conversationId={conversationId}
      />

      <div className="mx-auto flex min-h-screen max-w-3xl flex-col">
        {/* Header */}
        <header className="border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/messages"
              className="rounded-lg px-2 py-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              ←
            </Link>

            <div className="h-11 w-11 overflow-hidden rounded-full bg-slate-800">
              {otherUser?.avatarUrl ? (
                <img
                  src={otherUser.avatarUrl}
                  alt={otherUser.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-bold text-slate-400">
                  {(
                    otherUser?.name ??
                    conversation.name ??
                    "?"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate font-semibold">
                  {conversation.name ??
                    otherUser?.name ??
                    "Conversation"}
                </h1>

                {otherUser?.isVerified && (
                  <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold">
                    ✓
                  </span>
                )}
              </div>

              {otherUser?.username && (
                <Link
                  href={`/profile/${otherUser.username}`}
                  className="text-xs text-slate-500 hover:text-blue-400"
                >
                  @{otherUser.username}
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Messages */}
        <section className="flex-1 space-y-3 overflow-y-auto px-4 py-6">
          {conversation.messages.length === 0 ? (
            <div className="flex h-full min-h-96 items-center justify-center">
              <div className="text-center">
                <div className="text-4xl">💬</div>

                <h2 className="mt-4 font-semibold">
                  Start the conversation
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Send your first message below.
                </p>
              </div>
            </div>
          ) : (
            conversation.messages.map((message) => {
              const isMine =
                message.senderId === currentUser.id;

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isMine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      isMine
                        ? "rounded-br-md bg-blue-600 text-white"
                        : "rounded-bl-md bg-slate-800 text-slate-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm">
                      {message.content}
                    </p>

                    <p
                      className={`mt-1 text-[10px] ${
                        isMine
                          ? "text-blue-200"
                          : "text-slate-500"
                      }`}
                    >
                      {new Intl.DateTimeFormat(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                        },
                      ).format(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* Composer */}
        <div className="border-t border-white/10 p-4">
          <ChatForm
            conversationId={conversationId}
          />
        </div>
      </div>
    </main>
  );
}
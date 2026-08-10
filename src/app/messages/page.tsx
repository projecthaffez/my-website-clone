import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export default async function MessagesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const conversations =
    await db.conversationParticipant.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        conversation: {
          updatedAt: "desc",
        },
      },
      select: {
        conversationId: true,
        lastReadAt: true,

        conversation: {
          select: {
            id: true,
            isGroup: true,
            name: true,
            updatedAt: true,

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
                createdAt: "desc",
              },
              take: 1,
              select: {
                id: true,
                content: true,
                senderId: true,
                createdAt: true,
              },
            },

            _count: {
              select: {
                messages: {
                  where: {
                    isDeleted: false,
                  },
                },
              },
            },
          },
        },
      },
    });

  const conversationItems = conversations.map(
    (participant) => {
      const conversation = participant.conversation;

      const otherParticipant =
        conversation.participants[0]?.user ?? null;

      const latestMessage =
        conversation.messages[0] ?? null;

      const unread =
        latestMessage &&
        latestMessage.senderId !== currentUser.id &&
        latestMessage.createdAt > participant.lastReadAt;

      return {
        id: conversation.id,
        isGroup: conversation.isGroup,
        name:
          conversation.name ??
          otherParticipant?.name ??
          "Unknown User",
        username:
          otherParticipant?.username ?? null,
        avatarUrl:
          otherParticipant?.avatarUrl ?? null,
        isVerified:
          otherParticipant?.isVerified ?? false,
        isBanned:
          otherParticipant?.isBanned ?? false,
        latestMessage,
        unread: Boolean(unread),
      };
    },
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-400">
                Nexus
              </p>

              <h1 className="mt-1 text-3xl font-bold">
                Messages
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Your private conversations.
              </p>
            </div>

            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
            >
              Home
            </Link>
          </div>
        </div>

        {/* Conversations */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
          {conversationItems.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="text-5xl">💬</div>

              <h2 className="mt-5 text-xl font-semibold">
                No conversations yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                Start a conversation from another user's
                profile when messaging is available.
              </p>

              <Link
                href="/friends"
                className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-500"
              >
                Find Friends
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {conversationItems.map(
                (conversation) => (
                  <Link
                    key={conversation.id}
                    href={`/messages/${conversation.id}`}
                    className={`flex gap-4 px-5 py-4 transition hover:bg-white/5 ${
                      conversation.unread
                        ? "bg-blue-500/5"
                        : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-800">
                      {conversation.avatarUrl ? (
                        <img
                          src={conversation.avatarUrl}
                          alt={conversation.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-bold text-slate-400">
                          {conversation.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      {conversation.unread && (
                        <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-blue-500 ring-2 ring-slate-900" />
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2
                          className={`truncate text-sm ${
                            conversation.unread
                              ? "font-bold text-white"
                              : "font-semibold text-slate-200"
                          }`}
                        >
                          {conversation.name}
                        </h2>

                        {conversation.isVerified && (
                          <span className="shrink-0 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold">
                            ✓
                          </span>
                        )}
                      </div>

                      {conversation.username && (
                        <p className="text-xs text-slate-500">
                          @{conversation.username}
                        </p>
                      )}

                      <p
                        className={`mt-1 truncate text-sm ${
                          conversation.unread
                            ? "font-medium text-slate-200"
                            : "text-slate-500"
                        }`}
                      >
                        {conversation.latestMessage
                          ? conversation.latestMessage.senderId ===
                            currentUser.id
                            ? `You: ${conversation.latestMessage.content}`
                            : conversation.latestMessage.content
                          : "No messages yet"}
                      </p>
                    </div>

                    {/* Unread Indicator */}
                    {conversation.unread && (
                      <div className="flex shrink-0 items-center">
                        <span className="rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold text-white">
                          NEW
                        </span>
                      </div>
                    )}
                  </Link>
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
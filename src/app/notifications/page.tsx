import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/actions/notification";

function getNotificationText(
  type: string,
  actorName: string,
) {
  switch (type) {
    case "FOLLOW":
      return `${actorName} started following you.`;

    case "FRIEND_REQUEST":
      return `${actorName} sent you a friend request.`;

    case "FRIEND_ACCEPT":
    case "FRIEND_ACCEPTED":
      return `${actorName} accepted your friend request.`;

    case "LIKE":
      return `${actorName} liked your post.`;

    case "COMMENT":
      return `${actorName} commented on your post.`;

    case "REPLY":
      return `${actorName} replied to your comment.`;

    case "MESSAGE":
      return `${actorName} sent you a message.`;

    case "MENTION":
      return `${actorName} mentioned you.`;

    case "SYSTEM":
      return "You have a new notification.";

    default:
      return `${actorName} interacted with you.`;
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "MESSAGE":
      return "💬";

    case "FRIEND_REQUEST":
      return "👥";

    case "FRIEND_ACCEPT":
    case "FRIEND_ACCEPTED":
      return "🤝";

    case "FOLLOW":
      return "👤";

    case "LIKE":
      return "❤️";

    case "COMMENT":
      return "💬";

    case "REPLY":
      return "↩️";

    case "MENTION":
      return "@";

    case "SYSTEM":
      return "⚙️";

    default:
      return "🔔";
  }
}

function getNotificationTarget(
  notification: {
    type: string;
    targetUrl: string | null;
    targetId: string | null;
    actor: {
      username: string;
    };
  },
) {
  /*
   * Prefer an explicitly stored target URL.
   */
  if (notification.targetUrl) {
    return notification.targetUrl;
  }

  /*
   * Message notifications should open the
   * conversation. The notification targetId
   * is expected to contain the conversation ID.
   */
  if (
    notification.type === "MESSAGE" &&
    notification.targetId
  ) {
    return `/messages/${notification.targetId}`;
  }

  /*
   * Friend requests go to the request page.
   */
  if (notification.type === "FRIEND_REQUEST") {
    return "/friends/requests";
  }

  /*
   * Follow / accepted friend / general profile
   * interactions go to the actor's profile.
   */
  if (
    notification.type === "FOLLOW" ||
    notification.type === "FRIEND_ACCEPT" ||
    notification.type === "FRIEND_ACCEPTED"
  ) {
    return `/profile/${notification.actor.username}`;
  }

  return "/notifications";
}

export default async function NotificationsPage() {
  const result = await getNotificationsAction();

  if (!result.success) {
    redirect("/login");
  }

  const unreadCount = result.notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  async function markAllAsRead() {
    "use server";

    await markAllNotificationsReadAction();
  }

  async function markAsRead(
    notificationId: string,
  ) {
    "use server";

    await markNotificationReadAction(
      notificationId,
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                Notifications
              </h1>

              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Stay updated with activity on your account.
            </p>
          </div>

          {unreadCount > 0 && (
            <form action={markAllAsRead}>
              <button
                type="submit"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Mark all as read
              </button>
            </form>
          )}
        </div>

        {/* Empty State */}
        {result.notifications.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center">
            <div className="text-4xl">🔔</div>

            <h2 className="mt-4 text-lg font-semibold">
              No notifications yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              When someone interacts with you, you
              will see it here.
            </p>
          </div>
        ) : (
          /* Notifications */
          <div className="space-y-2">
            {result.notifications.map(
              (notification) => {
                const targetUrl =
                  getNotificationTarget(notification);

                return (
                  <div
                    key={notification.id}
                    className={`rounded-2xl border transition hover:bg-white/5 ${
                      notification.isRead
                        ? "border-white/10 bg-slate-900"
                        : "border-blue-500/20 bg-blue-500/5"
                    }`}
                  >
                    <div className="flex gap-3 p-4">
                      {/* Avatar */}
                      <Link
                        href={`/profile/${notification.actor.username}`}
                        className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-slate-800"
                      >
                        {notification.actor.avatarUrl ? (
                          <img
                            src={
                              notification.actor.avatarUrl
                            }
                            alt={
                              notification.actor.name
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-bold text-slate-400">
                            {notification.actor.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </Link>

                      {/* Notification */}
                      <div className="min-w-0 flex-1">
                        <form
                          action={markAsRead.bind(
                            null,
                            notification.id,
                          )}
                        >
                          <button
                            type="submit"
                            className="w-full text-left"
                          >
                            <div className="flex items-start gap-3">
                              <span className="mt-0.5 text-lg">
                                {getNotificationIcon(
                                  notification.type,
                                )}
                              </span>

                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-slate-300">
                                  {getNotificationText(
                                    notification.type,
                                    notification.actor
                                      .name,
                                  )}
                                </p>

                                <p className="mt-1 text-xs text-slate-600">
                                  {new Intl.DateTimeFormat(
                                    "en-US",
                                    {
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                    },
                                  ).format(
                                    notification.createdAt,
                                  )}
                                </p>
                              </div>

                              {!notification.isRead && (
                                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                              )}
                            </div>
                          </button>
                        </form>

                        {/* Open target */}
                        {targetUrl !== "/notifications" && (
                          <div className="mt-3 pl-8">
                            <Link
                              href={targetUrl}
                              className="inline-flex rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                            >
                              {notification.type ===
                              "MESSAGE"
                                ? "Open conversation"
                                : notification.type ===
                                  "FRIEND_REQUEST"
                                ? "View request"
                                : "View"}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>
    </main>
  );
}
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getNotificationsAction,
  markAllNotificationsReadAction,
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

    case "FRIEND_ACCEPTED":
      return `${actorName} accepted your friend request.`;

    case "LIKE":
      return `${actorName} liked your post.`;

    case "COMMENT":
      return `${actorName} commented on your post.`;

    case "REPLY":
      return `${actorName} replied to your comment.`;

    default:
      return `${actorName} interacted with you.`;
  }
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

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Stay updated with activity on your account.
            </p>
          </div>

          {unreadCount > 0 && (
            <form action={markAllAsRead}>
              <button
                type="submit"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
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
              When someone interacts with you, you will see
              it here.
            </p>
          </div>
        ) : (
          /* Notifications */
          <div className="space-y-2">
            {result.notifications.map((notification) => (
              <Link
                key={notification.id}
                href={
                  notification.targetUrl ||
                  "/notifications"
                }
                className={`block rounded-2xl border p-4 transition hover:bg-white/5 ${
                  notification.isRead
                    ? "border-white/10 bg-slate-900"
                    : "border-blue-500/20 bg-blue-500/5"
                }`}
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-slate-800">
                    {notification.actor.avatarUrl ? (
                      <img
                        src={notification.actor.avatarUrl}
                        alt={notification.actor.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-slate-400">
                        {notification.actor.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-300">
                      {getNotificationText(
                        notification.type,
                        notification.actor.name,
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(notification.createdAt)}
                    </p>
                  </div>

                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
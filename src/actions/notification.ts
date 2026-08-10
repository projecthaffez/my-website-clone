"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getNotificationsAction() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false as const,
      error: "You must be logged in.",
      notifications: [],
    };
  }

  const notifications = await db.notification.findMany({
    where: {
      recipientId: currentUser.id,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 30,

    include: {
      actor: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return {
    success: true as const,
    notifications,
  };
}

export async function getUnreadNotificationCountAction() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false as const,
      count: 0,
    };
  }

  const count = await db.notification.count({
    where: {
      recipientId: currentUser.id,
      isRead: false,
    },
  });

  return {
    success: true as const,
    count,
  };
}

export async function markNotificationReadAction(
  notificationId: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in.",
      };
    }

    const notification = await db.notification.findUnique({
      where: {
        id: notificationId,
      },

      select: {
        id: true,
        recipientId: true,
        isRead: true,
      },
    });

    if (!notification) {
      return {
        success: false as const,
        error: "Notification not found.",
      };
    }

    /*
     * Security:
     * A user can only modify their own notifications.
     */
    if (notification.recipientId !== currentUser.id) {
      return {
        success: false as const,
        error: "You cannot modify this notification.",
      };
    }

    /*
     * Avoid unnecessary database writes.
     */
    if (!notification.isRead) {
      await db.notification.update({
        where: {
          id: notificationId,
        },

        data: {
          isRead: true,
        },
      });
    }

    revalidatePath("/notifications");

    return {
      success: true as const,
    };
  } catch (error) {
    console.error(
      "markNotificationReadAction failed:",
      error,
    );

    return {
      success: false as const,
      error: "Failed to update notification.",
    };
  }
}

export async function markAllNotificationsReadAction() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in.",
      };
    }

    await db.notification.updateMany({
      where: {
        recipientId: currentUser.id,
        isRead: false,
      },

      data: {
        isRead: true,
      },
    });

    revalidatePath("/notifications");

    return {
      success: true as const,
    };
  } catch (error) {
    console.error(
      "markAllNotificationsReadAction failed:",
      error,
    );

    return {
      success: false as const,
      error: "Failed to mark notifications as read.",
    };
  }
}
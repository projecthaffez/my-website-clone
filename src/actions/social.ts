"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function followUserAction(targetUserId: string) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in to follow users.",
      };
    }

    if (!targetUserId || targetUserId === currentUser.id) {
      return {
        success: false as const,
        error: "You cannot follow yourself.",
      };
    }

    const targetUser = await db.user.findUnique({
      where: {
        id: targetUserId,
      },
      select: {
        id: true,
        username: true,
        isBanned: true,
      },
    });

    if (!targetUser || targetUser.isBanned) {
      return {
        success: false as const,
        error: "User not found.",
      };
    }

    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUser.id,
        },
      },
    });

    if (existingFollow) {
      return {
        success: true as const,
        message: "Already following this user.",
      };
    }

    await db.follow.create({
      data: {
        followerId: currentUser.id,
        followingId: targetUser.id,
      },
    });

    revalidatePath(`/profile/${targetUser.username}`);
    revalidatePath(`/profile/${currentUser.username}`);

    return {
      success: true as const,
      message: "User followed successfully.",
    };
  } catch (error) {
    console.error("followUserAction failed:", error);

    return {
      success: false as const,
      error: "Failed to follow user. Please try again.",
    };
  }
}

export async function unfollowUserAction(targetUserId: string) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in to unfollow users.",
      };
    }

    if (!targetUserId || targetUserId === currentUser.id) {
      return {
        success: false as const,
        error: "Invalid user.",
      };
    }

    const targetUser = await db.user.findUnique({
      where: {
        id: targetUserId,
      },
      select: {
        id: true,
        username: true,
      },
    });

    if (!targetUser) {
      return {
        success: false as const,
        error: "User not found.",
      };
    }

    await db.follow.deleteMany({
      where: {
        followerId: currentUser.id,
        followingId: targetUser.id,
      },
    });

    revalidatePath(`/profile/${targetUser.username}`);
    revalidatePath(`/profile/${currentUser.username}`);

    return {
      success: true as const,
      message: "User unfollowed successfully.",
    };
  } catch (error) {
    console.error("unfollowUserAction failed:", error);

    return {
      success: false as const,
      error: "Failed to unfollow user. Please try again.",
    };
  }
}
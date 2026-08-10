"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function togglePostLikeAction(
  postId: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        liked: false,
        error: "You must be logged in to like posts.",
      };
    }

    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        authorId: true,
        isDeleted: true,
      },
    });

    if (!post || post.isDeleted) {
      return {
        success: false as const,
        liked: false,
        error: "Post not found.",
      };
    }

    const existingReaction =
      await db.reaction.findUnique({
        where: {
          userId_postId: {
            userId: currentUser.id,
            postId,
          },
        },
        select: {
          id: true,
        },
      });

    if (existingReaction) {
      await db.reaction.delete({
        where: {
          id: existingReaction.id,
        },
      });

      revalidatePath("/");
      revalidatePath(
        `/profile/${currentUser.username}`,
      );

      return {
        success: true as const,
        liked: false,
        message: "Post unliked.",
      };
    }

    await db.reaction.create({
      data: {
        userId: currentUser.id,
        postId,
        type: "LIKE",
      },
    });

    /*
     * Do not create a notification for your own post.
     */
    if (post.authorId !== currentUser.id) {
      await db.notification.create({
        data: {
          recipientId: post.authorId,
          actorId: currentUser.id,
          type: "LIKE",
          targetId: postId,
          targetUrl: "/",
        },
      });
    }

    revalidatePath("/");
    revalidatePath(
      `/profile/${currentUser.username}`,
    );

    return {
      success: true as const,
      liked: true,
      message: "Post liked.",
    };
  } catch (error) {
    console.error(
      "togglePostLikeAction failed:",
      error,
    );

    return {
      success: false as const,
      liked: false,
      error: "Failed to update post reaction.",
    };
  }
}
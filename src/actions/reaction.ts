"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function togglePostLikeAction(postId: string) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in to like a post.",
      };
    }

    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        isDeleted: true,
        authorId: true,
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!post || post.isDeleted) {
      return {
        success: false as const,
        error: "Post not found.",
      };
    }

    const existingReaction = await db.reaction.findUnique({
      where: {
        userId_postId: {
          userId: currentUser.id,
          postId,
        },
      },
      select: {
        id: true,
        type: true,
      },
    });

    // Unlike
    if (existingReaction) {
      await db.reaction.delete({
        where: {
          id: existingReaction.id,
        },
      });

      revalidatePath("/");
      revalidatePath(`/profile/${currentUser.username}`);
      revalidatePath(`/profile/${post.author.username}`);
      revalidatePath("/notifications");

      return {
        success: true as const,
        liked: false,
      };
    }

    // Like
    await db.reaction.create({
      data: {
        userId: currentUser.id,
        postId,
        type: "LIKE",
      },
    });

    // Do not notify users when they like their own post
    if (post.authorId !== currentUser.id) {
      await db.notification.create({
        data: {
          recipientId: post.authorId,
          actorId: currentUser.id,
          type: "LIKE",
          targetId: post.id,
          targetUrl: `/profile/${post.author.username}`,
        },
      });
    }

    revalidatePath("/");
    revalidatePath(`/profile/${currentUser.username}`);
    revalidatePath(`/profile/${post.author.username}`);
    revalidatePath("/notifications");

    return {
      success: true as const,
      liked: true,
    };
  } catch (error) {
    console.error(
      "togglePostLikeAction failed:",
      error,
    );

    return {
      success: false as const,
      error: "Failed to update like. Please try again.",
    };
  }
}
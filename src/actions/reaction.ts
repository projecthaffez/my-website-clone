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

    if (existingReaction) {
      await db.reaction.delete({
        where: {
          id: existingReaction.id,
        },
      });

      revalidatePath("/");
      revalidatePath(`/profile/${currentUser.username}`);

      return {
        success: true as const,
        liked: false,
      };
    }

    await db.reaction.create({
      data: {
        userId: currentUser.id,
        postId,
        type: "LIKE",
      },
    });

    revalidatePath("/");
    revalidatePath(`/profile/${currentUser.username}`);

    return {
      success: true as const,
      liked: true,
    };
  } catch (error) {
    console.error("togglePostLikeAction failed:", error);

    return {
      success: false as const,
      error: "Failed to update like. Please try again.",
    };
  }
}
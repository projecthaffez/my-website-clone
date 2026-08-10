"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleSavePostAction(
  postId: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        saved: false,
        error: "You must be logged in to save posts.",
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
        saved: false,
        error: "Post not found.",
      };
    }

    const existingSavedPost =
      await db.savedPost.findUnique({
        where: {
          userId_postId: {
            userId: currentUser.id,
            postId,
          },
        },
        select: {
          userId: true,
          postId: true,
        },
      });

    if (existingSavedPost) {
      await db.savedPost.delete({
        where: {
          userId_postId: {
            userId: currentUser.id,
            postId,
          },
        },
      });

      revalidatePath("/");
      revalidatePath(
        `/profile/${currentUser.username}`,
      );

      return {
        success: true as const,
        saved: false,
        message: "Post removed from saved posts.",
      };
    }

    await db.savedPost.create({
      data: {
        userId: currentUser.id,
        postId,
      },
    });

    revalidatePath("/");
    revalidatePath(
      `/profile/${currentUser.username}`,
    );

    return {
      success: true as const,
      saved: true,
      message: "Post saved successfully.",
    };
  } catch (error) {
    console.error(
      "toggleSavePostAction failed:",
      error,
    );

    return {
      success: false as const,
      saved: false,
      error: "Failed to update saved post.",
    };
  }
}
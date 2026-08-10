"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createPostAction(content: string) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in to create a post.",
      };
    }

    const cleanContent = content.trim();

    if (!cleanContent) {
      return {
        success: false as const,
        error: "Post cannot be empty.",
      };
    }

    if (cleanContent.length > 5000) {
      return {
        success: false as const,
        error: "Post cannot exceed 5000 characters.",
      };
    }

    const post = await db.post.create({
      data: {
        authorId: currentUser.id,
        content: cleanContent,
        visibility: "PUBLIC",
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/");
    revalidatePath(`/profile/${currentUser.username}`);

    return {
      success: true as const,
      message: "Post created successfully.",
      postId: post.id,
    };
  } catch (error) {
    console.error("createPostAction failed:", error);

    return {
      success: false as const,
      error: "Failed to create post. Please try again.",
    };
  }
}
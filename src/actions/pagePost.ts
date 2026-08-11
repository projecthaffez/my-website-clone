"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createPagePostAction(
  pageId: string,
  content: string,
) {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in.",
      };
    }

    const cleanContent =
      content.trim();

    if (!cleanContent) {
      return {
        success: false as const,
        error: "Post cannot be empty.",
      };
    }

    if (cleanContent.length > 5000) {
      return {
        success: false as const,
        error:
          "Post cannot exceed 5000 characters.",
      };
    }

    const page = await db.page.findUnique({
      where: {
        id: pageId,
      },
      select: {
        id: true,
        slug: true,
        ownerId: true,
      },
    });

    if (!page) {
      return {
        success: false as const,
        error: "Page not found.",
      };
    }

    if (page.ownerId !== currentUser.id) {
      return {
        success: false as const,
        error:
          "Only the page owner can create page posts.",
      };
    }

    const post =
      await db.post.create({
        data: {
          authorId: currentUser.id,
          pageId: page.id,
          content: cleanContent,
          visibility: "PUBLIC",
        },

        select: {
          id: true,
        },
      });

    revalidatePath(
      `/pages/${page.slug}`,
    );

    revalidatePath("/pages");

    revalidatePath(
      `/profile/${currentUser.username}`,
    );

    return {
      success: true as const,
      message:
        "Page post created successfully.",
      postId: post.id,
    };
  } catch (error) {
    console.error(
      "createPagePostAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to create page post. Please try again.",
    };
  }
}

export async function deletePagePostAction(
  postId: string,
) {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in.",
      };
    }

    const post =
      await db.post.findUnique({
        where: {
          id: postId,
        },

        select: {
          id: true,
          authorId: true,
          pageId: true,
          isDeleted: true,

          page: {
            select: {
              id: true,
              slug: true,
              ownerId: true,
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

    if (!post.page) {
      return {
        success: false as const,
        error:
          "This is not a page post.",
      };
    }

    if (
      post.page.ownerId !==
      currentUser.id
    ) {
      return {
        success: false as const,
        error:
          "Only the page owner can delete this post.",
      };
    }

    await db.post.update({
      where: {
        id: post.id,
      },

      data: {
        isDeleted: true,
      },
    });

    revalidatePath(
      `/pages/${post.page.slug}`,
    );

    revalidatePath("/pages");

    return {
      success: true as const,
      message:
        "Page post deleted successfully.",
    };
  } catch (error) {
    console.error(
      "deletePagePostAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to delete page post.",
    };
  }
}
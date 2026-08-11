"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type PostMediaInput = {
  url: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
  aspectRatio?: number | null;
};

export async function createPostAction(
  content: string,
  media: PostMediaInput[] = [],
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error:
          "You must be logged in to create a post.",
      };
    }

    const cleanContent = content.trim();

    if (!cleanContent && media.length === 0) {
      return {
        success: false as const,
        error:
          "Write something or attach a file before posting.",
      };
    }

    if (cleanContent.length > 5000) {
      return {
        success: false as const,
        error:
          "Post cannot exceed 5000 characters.",
      };
    }

    if (media.length > 10) {
      return {
        success: false as const,
        error:
          "You can attach a maximum of 10 files.",
      };
    }

    for (const item of media) {
      if (!item.url || !item.url.startsWith("/uploads/")) {
        return {
          success: false as const,
          error: "Invalid media file.",
        };
      }

      if (
        item.type !== "IMAGE" &&
        item.type !== "VIDEO" &&
        item.type !== "DOCUMENT"
      ) {
        return {
          success: false as const,
          error: "Invalid media type.",
        };
      }

      if (
        item.aspectRatio !== undefined &&
        item.aspectRatio !== null &&
        (!Number.isFinite(item.aspectRatio) ||
          item.aspectRatio <= 0)
      ) {
        return {
          success: false as const,
          error: "Invalid media aspect ratio.",
        };
      }
    }

    const post = await db.post.create({
      data: {
        authorId: currentUser.id,
        content: cleanContent,
        visibility: "PUBLIC",

        media:
          media.length > 0
            ? {
                create: media.map((item) => ({
                  url: item.url,
                  type: item.type,
                  aspectRatio:
                    item.aspectRatio ?? null,
                })),
              }
            : undefined,
      },

      select: {
        id: true,
      },
    });

    revalidatePath("/");
    revalidatePath(
      `/profile/${currentUser.username}`,
    );

    return {
      success: true as const,
      message:
        "Post created successfully.",
      postId: post.id,
    };
  } catch (error) {
    console.error(
      "createPostAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to create post. Please try again.",
    };
  }
}

export async function deletePostAction(
  postId: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in.",
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

    if (!post) {
      return {
        success: false as const,
        error: "Post not found.",
      };
    }

    if (post.authorId !== currentUser.id) {
      return {
        success: false as const,
        error:
          "You can only delete your own posts.",
      };
    }

    if (post.isDeleted) {
      return {
        success: false as const,
        error:
          "Post has already been deleted.",
      };
    }

    await db.post.update({
      where: {
        id: postId,
      },
      data: {
        isDeleted: true,
      },
    });

    revalidatePath("/");
    revalidatePath(
      `/profile/${currentUser.username}`,
    );

    return {
      success: true as const,
      message:
        "Post deleted successfully.",
    };
  } catch (error) {
    console.error(
      "deletePostAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to delete post. Please try again.",
    };
  }
}

export async function togglePinPostAction(
  postId: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        pinned: false,
        error: "You must be logged in.",
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
        isPinned: true,
      },
    });

    if (!post || post.isDeleted) {
      return {
        success: false as const,
        pinned: false,
        error: "Post not found.",
      };
    }

    if (post.authorId !== currentUser.id) {
      return {
        success: false as const,
        pinned: false,
        error:
          "You can only pin your own posts.",
      };
    }

    const nextPinned = !post.isPinned;

    if (nextPinned) {
      await db.post.updateMany({
        where: {
          authorId: currentUser.id,
          isPinned: true,
          id: {
            not: postId,
          },
        },
        data: {
          isPinned: false,
        },
      });
    }

    await db.post.update({
      where: {
        id: postId,
      },
      data: {
        isPinned: nextPinned,
      },
    });

    revalidatePath("/");
    revalidatePath(
      `/profile/${currentUser.username}`,
    );

    return {
      success: true as const,
      pinned: nextPinned,
      message: nextPinned
        ? "Post pinned successfully."
        : "Post unpinned successfully.",
    };
  } catch (error) {
    console.error(
      "togglePinPostAction failed:",
      error,
    );

    return {
      success: false as const,
      pinned: false,
      error:
        "Failed to update pinned post.",
    };
  }
}
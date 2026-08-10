"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createCommentAction(
  postId: string,
  content: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in to comment.",
      };
    }

    const cleanContent = content.trim();

    if (!cleanContent) {
      return {
        success: false as const,
        error: "Comment cannot be empty.",
      };
    }

    if (cleanContent.length > 2000) {
      return {
        success: false as const,
        error: "Comment cannot exceed 2000 characters.",
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

    const comment = await db.comment.create({
      data: {
        postId,
        authorId: currentUser.id,
        content: cleanContent,
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/");

    return {
      success: true as const,
      message: "Comment added successfully.",
      commentId: comment.id,
    };
  } catch (error) {
    console.error("createCommentAction failed:", error);

    return {
      success: false as const,
      error: "Failed to add comment. Please try again.",
    };
  }
}

export async function deleteCommentAction(
  commentId: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in.",
      };
    }

    const comment = await db.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        id: true,
        authorId: true,
        isDeleted: true,
      },
    });

    if (!comment) {
      return {
        success: false as const,
        error: "Comment not found.",
      };
    }

    if (comment.authorId !== currentUser.id) {
      return {
        success: false as const,
        error: "You can only delete your own comments.",
      };
    }

    if (comment.isDeleted) {
      return {
        success: false as const,
        error: "Comment has already been deleted.",
      };
    }

    await db.comment.update({
      where: {
        id: commentId,
      },
      data: {
        isDeleted: true,
      },
    });

    revalidatePath("/");

    return {
      success: true as const,
      message: "Comment deleted successfully.",
    };
  } catch (error) {
    console.error("deleteCommentAction failed:", error);

    return {
      success: false as const,
      error: "Failed to delete comment. Please try again.",
    };
  }
}

export async function createReplyAction(
  postId: string,
  parentId: string,
  content: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in to reply.",
      };
    }

    const cleanContent = content.trim();

    if (!cleanContent) {
      return {
        success: false as const,
        error: "Reply cannot be empty.",
      };
    }

    if (cleanContent.length > 2000) {
      return {
        success: false as const,
        error: "Reply cannot exceed 2000 characters.",
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

    const parentComment = await db.comment.findUnique({
      where: {
        id: parentId,
      },
      select: {
        id: true,
        postId: true,
        isDeleted: true,
        parentId: true,
      },
    });

    if (!parentComment || parentComment.isDeleted) {
      return {
        success: false as const,
        error: "Comment not found.",
      };
    }

    if (parentComment.postId !== postId) {
      return {
        success: false as const,
        error: "Invalid comment.",
      };
    }

    // Keep replies one level deep.
    if (parentComment.parentId !== null) {
      return {
        success: false as const,
        error: "Replies can only be made to a main comment.",
      };
    }

    const reply = await db.comment.create({
      data: {
        postId,
        authorId: currentUser.id,
        parentId,
        content: cleanContent,
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/");

    return {
      success: true as const,
      message: "Reply added successfully.",
      replyId: reply.id,
    };
  } catch (error) {
    console.error("createReplyAction failed:", error);

    return {
      success: false as const,
      error: "Failed to add reply. Please try again.",
    };
  }
}
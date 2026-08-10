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
        authorId: true,
        author: {
          select: {
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

    // Notify post owner about the comment.
    // Do not notify when commenting on your own post.
    if (post.authorId !== currentUser.id) {
      await db.notification.create({
        data: {
          recipientId: post.authorId,
          actorId: currentUser.id,
          type: "COMMENT",
          targetId: post.id,
          targetUrl: `/profile/${post.author.username}`,
        },
      });
    }

    revalidatePath("/");
    revalidatePath(`/profile/${post.author.username}`);
    revalidatePath("/notifications");

    return {
      success: true as const,
      message: "Comment added successfully.",
      commentId: comment.id,
    };
  } catch (error) {
    console.error(
      "createCommentAction failed:",
      error,
    );

    return {
      success: false as const,
      error: "Failed to add comment. Please try again.",
    };
  }
}

export async function createReplyAction(
  commentId: string,
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

    const parentComment = await db.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        id: true,
        postId: true,
        authorId: true,
        isDeleted: true,
        author: {
          select: {
            username: true,
          },
        },
        post: {
          select: {
            id: true,
            isDeleted: true,
            authorId: true,
          },
        },
      },
    });

    if (
      !parentComment ||
      parentComment.isDeleted ||
      parentComment.post.isDeleted
    ) {
      return {
        success: false as const,
        error: "Comment not found.",
      };
    }

    const reply = await db.comment.create({
      data: {
        postId: parentComment.postId,
        authorId: currentUser.id,
        parentId: parentComment.id,
        content: cleanContent,
      },
      select: {
        id: true,
      },
    });

    // Notify the person whose comment was replied to.
    // Do not notify when replying to your own comment.
    if (parentComment.authorId !== currentUser.id) {
      await db.notification.create({
        data: {
          recipientId: parentComment.authorId,
          actorId: currentUser.id,
          type: "REPLY",
          targetId: parentComment.id,
          targetUrl: `/profile/${parentComment.author.username}`,
        },
      });
    }

    // If the reply is made to somebody else's comment,
    // the parent comment owner gets the notification above.
    // If the parent comment belongs to the post owner, they
    // already receive the reply notification through that same path.

    revalidatePath("/");
    revalidatePath("/notifications");

    return {
      success: true as const,
      message: "Reply added successfully.",
      commentId: reply.id,
    };
  } catch (error) {
    console.error(
      "createReplyAction failed:",
      error,
    );

    return {
      success: false as const,
      error: "Failed to add reply. Please try again.",
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
    revalidatePath("/notifications");

    return {
      success: true as const,
      message: "Comment deleted successfully.",
    };
  } catch (error) {
    console.error(
      "deleteCommentAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to delete comment. Please try again.",
    };
  }
}
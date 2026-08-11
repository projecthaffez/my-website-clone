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
    revalidatePath(`/posts/${post.id}`);
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

    const parentComment =
      await db.comment.findUnique({
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

    if (parentComment.authorId !== currentUser.id) {
      await db.notification.create({
        data: {
          recipientId: parentComment.authorId,
          actorId: currentUser.id,
          type: "REPLY",
          targetId: parentComment.id,
          targetUrl: `/posts/${parentComment.postId}`,
        },
      });
    }

    revalidatePath("/");
    revalidatePath(
      `/posts/${parentComment.postId}`,
    );
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

export async function editCommentAction(
  commentId: string,
  content: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in to edit comments.",
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

    const comment = await db.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        id: true,
        postId: true,
        authorId: true,
        isDeleted: true,
        post: {
          select: {
            id: true,
            isDeleted: true,
          },
        },
      },
    });

    if (!comment || comment.isDeleted) {
      return {
        success: false as const,
        error: "Comment not found.",
      };
    }

    if (comment.post.isDeleted) {
      return {
        success: false as const,
        error: "Post not found.",
      };
    }

    if (comment.authorId !== currentUser.id) {
      return {
        success: false as const,
        error:
          "You can only edit your own comments.",
      };
    }

    await db.comment.update({
      where: {
        id: commentId,
      },
      data: {
        content: cleanContent,
      },
    });

    revalidatePath(`/posts/${comment.postId}`);
    revalidatePath("/");
    revalidatePath("/notifications");

    return {
      success: true as const,
      message: "Comment updated successfully.",
    };
  } catch (error) {
    console.error(
      "editCommentAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to update comment. Please try again.",
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
        postId: true,
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
        error:
          "You can only delete your own comments.",
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
    revalidatePath(`/posts/${comment.postId}`);
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
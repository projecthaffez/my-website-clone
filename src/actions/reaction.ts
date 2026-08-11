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
        group: {
          select: {
            slug: true,
          },
        },
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

      if (post.group?.slug) {
        revalidatePath(
          `/groups/${post.group.slug}`,
        );
      }

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

    if (post.authorId !== currentUser.id) {
      await db.notification.create({
        data: {
          recipientId: post.authorId,
          actorId: currentUser.id,
          type: "LIKE",
          targetId: postId,
          targetUrl: post.group?.slug
            ? `/groups/${post.group.slug}`
            : "/",
        },
      });
    }

    revalidatePath("/");
    revalidatePath(
      `/profile/${currentUser.username}`,
    );

    if (post.group?.slug) {
      revalidatePath(
        `/groups/${post.group.slug}`,
      );
    }

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
      error:
        "Failed to update post reaction.",
    };
  }
}

export async function toggleCommentLikeAction(
  commentId: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        liked: false,
        count: 0,
        error:
          "You must be logged in to like comments.",
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

    if (
      !comment ||
      comment.isDeleted ||
      comment.post.isDeleted
    ) {
      return {
        success: false as const,
        liked: false,
        count: 0,
        error: "Comment not found.",
      };
    }

    const existingReaction =
      await db.reaction.findUnique({
        where: {
          userId_commentId: {
            userId: currentUser.id,
            commentId,
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

      const count = await db.reaction.count({
        where: {
          commentId,
        },
      });

      revalidatePath(`/posts/${comment.postId}`);
      revalidatePath("/notifications");

      return {
        success: true as const,
        liked: false,
        count,
        message: "Comment unliked.",
      };
    }

    await db.reaction.create({
      data: {
        userId: currentUser.id,
        commentId,
        type: "LIKE",
      },
    });

    if (comment.authorId !== currentUser.id) {
      await db.notification.create({
        data: {
          recipientId: comment.authorId,
          actorId: currentUser.id,
          type: "LIKE",
          targetId: comment.id,
          targetUrl: `/posts/${comment.postId}`,
        },
      });
    }

    const count = await db.reaction.count({
      where: {
        commentId,
      },
    });

    revalidatePath(`/posts/${comment.postId}`);
    revalidatePath("/notifications");

    return {
      success: true as const,
      liked: true,
      count,
      message: "Comment liked.",
    };
  } catch (error) {
    console.error(
      "toggleCommentLikeAction failed:",
      error,
    );

    return {
      success: false as const,
      liked: false,
      count: 0,
      error:
        "Failed to update comment reaction.",
    };
  }
}
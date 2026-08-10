"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getConversationAccess(
  conversationId: string,
  userId: string,
) {
  return db.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
    select: {
      conversationId: true,
      userId: true,
    },
  });
}

export async function createConversationAction(
  targetUserId: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in to start a conversation.",
      };
    }

    if (!targetUserId || targetUserId === currentUser.id) {
      return {
        success: false as const,
        error: "Invalid user.",
      };
    }

    const targetUser = await db.user.findUnique({
      where: {
        id: targetUserId,
      },
      select: {
        id: true,
        username: true,
        name: true,
        isBanned: true,
        allowMessages: true,
      },
    });

    if (!targetUser || targetUser.isBanned) {
      return {
        success: false as const,
        error: "User not found.",
      };
    }

    if (!targetUser.allowMessages) {
      return {
        success: false as const,
        error: "This user is not accepting messages.",
      };
    }

    const blockedRelationship =
      await db.friendship.findFirst({
        where: {
          status: "BLOCKED",
          OR: [
            {
              requesterId: currentUser.id,
              addresseeId: targetUser.id,
            },
            {
              requesterId: targetUser.id,
              addresseeId: currentUser.id,
            },
          ],
        },
        select: {
          id: true,
        },
      });

    if (blockedRelationship) {
      return {
        success: false as const,
        error:
          "You cannot message this user because one of you has blocked the other.",
      };
    }

    const existingConversation =
      await db.conversation.findFirst({
        where: {
          isGroup: false,
          AND: [
            {
              participants: {
                some: {
                  userId: currentUser.id,
                },
              },
            },
            {
              participants: {
                some: {
                  userId: targetUser.id,
                },
              },
            },
          ],
        },
        select: {
          id: true,
        },
      });

    if (existingConversation) {
      return {
        success: true as const,
        conversationId: existingConversation.id,
      };
    }

    const conversation = await db.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            {
              userId: currentUser.id,
            },
            {
              userId: targetUser.id,
            },
          ],
        },
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/messages");
    revalidatePath(
      `/messages/${conversation.id}`,
    );

    return {
      success: true as const,
      conversationId: conversation.id,
    };
  } catch (error) {
    console.error(
      "createConversationAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to create conversation. Please try again.",
    };
  }
}

export async function sendMessageAction(
  conversationId: string,
  content: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in to send messages.",
      };
    }

    if (!conversationId) {
      return {
        success: false as const,
        error: "Invalid conversation.",
      };
    }

    const cleanContent = content.trim();

    if (!cleanContent) {
      return {
        success: false as const,
        error: "Message cannot be empty.",
      };
    }

    if (cleanContent.length > 5000) {
      return {
        success: false as const,
        error:
          "Message cannot exceed 5000 characters.",
      };
    }

    const access = await getConversationAccess(
      conversationId,
      currentUser.id,
    );

    if (!access) {
      return {
        success: false as const,
        error:
          "You are not a participant in this conversation.",
      };
    }

    const conversation =
      await db.conversation.findUnique({
        where: {
          id: conversationId,
        },
        select: {
          id: true,
          isGroup: true,

          participants: {
            select: {
              userId: true,

              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  isBanned: true,
                  allowMessages: true,
                },
              },
            },
          },
        },
      });

    if (!conversation) {
      return {
        success: false as const,
        error: "Conversation not found.",
      };
    }

    const otherParticipants =
      conversation.participants.filter(
        (participant) =>
          participant.userId !== currentUser.id,
      );

    for (const participant of otherParticipants) {
      if (
        participant.user.isBanned ||
        !participant.user.allowMessages
      ) {
        return {
          success: false as const,
          error:
            "This user is not accepting messages.",
        };
      }

      const blockedRelationship =
        await db.friendship.findFirst({
          where: {
            status: "BLOCKED",
            OR: [
              {
                requesterId: currentUser.id,
                addresseeId: participant.userId,
              },
              {
                requesterId: participant.userId,
                addresseeId: currentUser.id,
              },
            ],
          },
          select: {
            id: true,
          },
        });

      if (blockedRelationship) {
        return {
          success: false as const,
          error:
            "You cannot message this user because one of you has blocked the other.",
        };
      }
    }

    const message = await db.message.create({
      data: {
        conversationId,
        senderId: currentUser.id,
        content: cleanContent,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });

    await db.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    /*
     * Notify every other participant.
     */
    for (const participant of otherParticipants) {
      await db.notification.create({
        data: {
          recipientId: participant.userId,
          actorId: currentUser.id,
          type: "MESSAGE",
          targetId: conversationId,
          targetUrl: `/messages/${conversationId}`,
        },
      });

      revalidatePath("/notifications");
    }

    revalidatePath("/messages");
    revalidatePath(
      `/messages/${conversationId}`,
    );

    return {
      success: true as const,
      message,
    };
  } catch (error) {
    console.error(
      "sendMessageAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to send message. Please try again.",
    };
  }
}

export async function markConversationReadAction(
  conversationId: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in.",
      };
    }

    if (!conversationId) {
      return {
        success: false as const,
        error: "Invalid conversation.",
      };
    }

    const access = await getConversationAccess(
      conversationId,
      currentUser.id,
    );

    if (!access) {
      return {
        success: false as const,
        error:
          "You are not a participant in this conversation.",
      };
    }

    await db.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUser.id,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    revalidatePath("/messages");
    revalidatePath(
      `/messages/${conversationId}`,
    );

    return {
      success: true as const,
    };
  } catch (error) {
    console.error(
      "markConversationReadAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to mark conversation as read.",
    };
  }
}

export async function deleteMessageAction(
  messageId: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in.",
      };
    }

    if (!messageId) {
      return {
        success: false as const,
        error: "Invalid message.",
      };
    }

    const message = await db.message.findUnique({
      where: {
        id: messageId,
      },
      select: {
        id: true,
        senderId: true,
        conversationId: true,
      },
    });

    if (!message) {
      return {
        success: false as const,
        error: "Message not found.",
      };
    }

    if (message.senderId !== currentUser.id) {
      return {
        success: false as const,
        error:
          "You can only delete your own messages.",
      };
    }

    const access = await getConversationAccess(
      message.conversationId,
      currentUser.id,
    );

    if (!access) {
      return {
        success: false as const,
        error:
          "You are not a participant in this conversation.",
      };
    }

    await db.message.update({
      where: {
        id: message.id,
      },
      data: {
        isDeleted: true,
        content: "This message was deleted.",
      },
    });

    revalidatePath(
      `/messages/${message.conversationId}`,
    );
    revalidatePath("/messages");

    return {
      success: true as const,
      message: "Message deleted.",
    };
  } catch (error) {
    console.error(
      "deleteMessageAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to delete message. Please try again.",
    };
  }
}
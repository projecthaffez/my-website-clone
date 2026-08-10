"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type FriendshipStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";

async function getTargetUser(targetUserId: string) {
  return db.user.findUnique({
    where: {
      id: targetUserId,
    },
    select: {
      id: true,
      username: true,
      isBanned: true,
    },
  });
}

export async function sendFriendRequestAction(
  targetUserId: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in to send friend requests.",
      };
    }

    if (!targetUserId || targetUserId === currentUser.id) {
      return {
        success: false as const,
        error: "You cannot send a friend request to yourself.",
      };
    }

    const targetUser = await getTargetUser(targetUserId);

    if (!targetUser || targetUser.isBanned) {
      return {
        success: false as const,
        error: "User not found.",
      };
    }

    const existingRequest = await db.friendship.findFirst({
      where: {
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
    });

    if (existingRequest) {
      if (existingRequest.status === "ACCEPTED") {
        return {
          success: false as const,
          error: "You are already friends with this user.",
        };
      }

      if (existingRequest.status === "PENDING") {
        return {
          success: false as const,
          error: "A friend request already exists.",
        };
      }

      if (existingRequest.status === "REJECTED") {
        await db.friendship.update({
          where: {
            id: existingRequest.id,
          },
          data: {
            requesterId: currentUser.id,
            addresseeId: targetUser.id,
            status: "PENDING",
          },
        });

        revalidatePath(`/profile/${targetUser.username}`);
        revalidatePath(`/profile/${currentUser.username}`);

        return {
          success: true as const,
          message: "Friend request sent.",
        };
      }
    }

    await db.friendship.create({
      data: {
        requesterId: currentUser.id,
        addresseeId: targetUser.id,
        status: "PENDING",
      },
    });

    revalidatePath(`/profile/${targetUser.username}`);
    revalidatePath(`/profile/${currentUser.username}`);

    return {
      success: true as const,
      message: "Friend request sent.",
    };
  } catch (error) {
    console.error("sendFriendRequestAction failed:", error);

    return {
      success: false as const,
      error: "Failed to send friend request. Please try again.",
    };
  }
}

export async function acceptFriendRequestAction(
  requestId: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in.",
      };
    }

    const request = await db.friendship.findUnique({
      where: {
        id: requestId,
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
          },
        },
        addressee: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!request) {
      return {
        success: false as const,
        error: "Friend request not found.",
      };
    }

    if (request.addresseeId !== currentUser.id) {
      return {
        success: false as const,
        error: "You are not authorized to accept this request.",
      };
    }

    if (request.status !== "PENDING") {
      return {
        success: false as const,
        error: "This request is no longer pending.",
      };
    }

    await db.friendship.update({
      where: {
        id: request.id,
      },
      data: {
        status: "ACCEPTED",
      },
    });

    revalidatePath(`/profile/${request.requester.username}`);
    revalidatePath(`/profile/${request.addressee.username}`);

    return {
      success: true as const,
      message: "Friend request accepted.",
    };
  } catch (error) {
    console.error("acceptFriendRequestAction failed:", error);

    return {
      success: false as const,
      error: "Failed to accept friend request.",
    };
  }
}

export async function rejectFriendRequestAction(
  requestId: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in.",
      };
    }

    const request = await db.friendship.findUnique({
      where: {
        id: requestId,
      },
      include: {
        requester: {
          select: {
            username: true,
          },
        },
        addressee: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!request) {
      return {
        success: false as const,
        error: "Friend request not found.",
      };
    }

    if (request.addresseeId !== currentUser.id) {
      return {
        success: false as const,
        error: "You are not authorized to reject this request.",
      };
    }

    if (request.status !== "PENDING") {
      return {
        success: false as const,
        error: "This request is no longer pending.",
      };
    }

    await db.friendship.update({
      where: {
        id: request.id,
      },
      data: {
        status: "REJECTED",
      },
    });

    revalidatePath(`/profile/${request.requester.username}`);
    revalidatePath(`/profile/${request.addressee.username}`);

    return {
      success: true as const,
      message: "Friend request rejected.",
    };
  } catch (error) {
    console.error("rejectFriendRequestAction failed:", error);

    return {
      success: false as const,
      error: "Failed to reject friend request.",
    };
  }
}

export async function cancelFriendRequestAction(
  targetUserId: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in.",
      };
    }

    const targetUser = await getTargetUser(targetUserId);

    if (!targetUser) {
      return {
        success: false as const,
        error: "User not found.",
      };
    }

    const request = await db.friendship.findFirst({
      where: {
        requesterId: currentUser.id,
        addresseeId: targetUser.id,
        status: "PENDING",
      },
    });

    if (!request) {
      return {
        success: false as const,
        error: "Pending friend request not found.",
      };
    }

    await db.friendship.delete({
      where: {
        id: request.id,
      },
    });

    revalidatePath(`/profile/${targetUser.username}`);
    revalidatePath(`/profile/${currentUser.username}`);

    return {
      success: true as const,
      message: "Friend request cancelled.",
    };
  } catch (error) {
    console.error("cancelFriendRequestAction failed:", error);

    return {
      success: false as const,
      error: "Failed to cancel friend request.",
    };
  }
}

export async function removeFriendAction(
  targetUserId: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in.",
      };
    }

    if (!targetUserId || targetUserId === currentUser.id) {
      return {
        success: false as const,
        error: "Invalid friend.",
      };
    }

    const friendship = await db.friendship.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          {
            requesterId: currentUser.id,
            addresseeId: targetUserId,
          },
          {
            requesterId: targetUserId,
            addresseeId: currentUser.id,
          },
        ],
      },
      include: {
        requester: {
          select: {
            username: true,
          },
        },
        addressee: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!friendship) {
      return {
        success: false as const,
        error: "You are not friends with this user.",
      };
    }

    await db.friendship.delete({
      where: {
        id: friendship.id,
      },
    });

    revalidatePath(`/profile/${friendship.requester.username}`);
    revalidatePath(`/profile/${friendship.addressee.username}`);
    revalidatePath(`/profile/${currentUser.username}`);

    return {
      success: true as const,
      message: "Friend removed.",
    };
  } catch (error) {
    console.error("removeFriendAction failed:", error);

    return {
      success: false as const,
      error: "Failed to remove friend.",
    };
  }
}
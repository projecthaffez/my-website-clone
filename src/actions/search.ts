"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function searchUsersAction(query: string) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in to search users.",
        users: [],
      };
    }

    const cleanQuery = query.trim();

    if (!cleanQuery) {
      return {
        success: true as const,
        users: [],
      };
    }

    if (cleanQuery.length > 100) {
      return {
        success: false as const,
        error: "Search query is too long.",
        users: [],
      };
    }

    const blockedRelationships =
      await db.friendship.findMany({
        where: {
          status: "BLOCKED",
          OR: [
            {
              requesterId: currentUser.id,
            },
            {
              addresseeId: currentUser.id,
            },
          ],
        },
        select: {
          requesterId: true,
          addresseeId: true,
        },
      });

    const blockedUserIds =
      blockedRelationships.map((relationship) =>
        relationship.requesterId === currentUser.id
          ? relationship.addresseeId
          : relationship.requesterId,
      );

    const users = await db.user.findMany({
      where: {
        id: {
          not: currentUser.id,
          notIn: blockedUserIds,
        },

        isBanned: false,

        OR: [
          {
            username: {
              contains: cleanQuery,
              mode: "insensitive",
            },
          },
          {
            name: {
              contains: cleanQuery,
              mode: "insensitive",
            },
          },
        ],
      },

      orderBy: [
        {
          isVerified: "desc",
        },
        {
          username: "asc",
        },
      ],

      take: 20,

      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        isVerified: true,
      },
    });

    return {
      success: true as const,
      users,
    };
  } catch (error) {
    console.error(
      "searchUsersAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to search users. Please try again.",
      users: [],
    };
  }
}
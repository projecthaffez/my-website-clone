"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function createSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createGroupAction(
  name: string,
  description: string,
  privacy: "PUBLIC" | "PRIVATE",
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in.",
      };
    }

    const cleanName = name.trim();
    const cleanDescription = description.trim();

    if (!cleanName) {
      return {
        success: false as const,
        error: "Group name is required.",
      };
    }

    if (cleanName.length < 3) {
      return {
        success: false as const,
        error:
          "Group name must be at least 3 characters.",
      };
    }

    if (cleanName.length > 100) {
      return {
        success: false as const,
        error:
          "Group name cannot exceed 100 characters.",
      };
    }

    if (cleanDescription.length > 1000) {
      return {
        success: false as const,
        error:
          "Description cannot exceed 1000 characters.",
      };
    }

    const baseSlug = createSlug(cleanName);

    if (!baseSlug) {
      return {
        success: false as const,
        error: "Invalid group name.",
      };
    }

    let slug = baseSlug;
    let counter = 2;

    while (
      await db.group.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const group = await db.group.create({
      data: {
        name: cleanName,
        slug,
        description: cleanDescription || null,
        privacy,
        creatorId: currentUser.id,

        members: {
          create: {
            userId: currentUser.id,
            role: "ADMIN",
          },
        },
      },

      select: {
        id: true,
        slug: true,
      },
    });

    revalidatePath("/groups");

    return {
      success: true as const,
      message: "Group created successfully.",
      groupId: group.id,
      slug: group.slug,
    };
  } catch (error) {
    console.error(
      "createGroupAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to create group. Please try again.",
    };
  }
}

export async function joinGroupAction(
  groupId: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in.",
      };
    }

    const group = await db.group.findUnique({
      where: {
        id: groupId,
      },
      select: {
        id: true,
        slug: true,
        privacy: true,
      },
    });

    if (!group) {
      return {
        success: false as const,
        error: "Group not found.",
      };
    }

    const existingMember =
      await db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: currentUser.id,
          },
        },
        select: {
          role: true,
        },
      });

    if (existingMember) {
      return {
        success: false as const,
        error: "You are already a member.",
      };
    }

    if (group.privacy === "PRIVATE") {
      return {
        success: false as const,
        error:
          "This is a private group. Membership requires approval.",
      };
    }

    await db.groupMember.create({
      data: {
        groupId,
        userId: currentUser.id,
        role: "MEMBER",
      },
    });

    revalidatePath("/groups");
    revalidatePath(`/groups/${group.slug}`);

    return {
      success: true as const,
      message: "You joined the group.",
    };
  } catch (error) {
    console.error(
      "joinGroupAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to join group. Please try again.",
    };
  }
}

export async function leaveGroupAction(
  groupId: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in.",
      };
    }

    const membership =
      await db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: currentUser.id,
          },
        },
        select: {
          role: true,
        },
      });

    if (!membership) {
      return {
        success: false as const,
        error:
          "You are not a member of this group.",
      };
    }

    if (membership.role === "ADMIN") {
      const adminCount =
        await db.groupMember.count({
          where: {
            groupId,
            role: "ADMIN",
          },
        });

      if (adminCount <= 1) {
        return {
          success: false as const,
          error:
            "The group admin cannot leave. Transfer ownership first.",
        };
      }
    }

    const group = await db.group.findUnique({
      where: {
        id: groupId,
      },
      select: {
        slug: true,
      },
    });

    await db.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId: currentUser.id,
        },
      },
    });

    revalidatePath("/groups");

    if (group) {
      revalidatePath(`/groups/${group.slug}`);
    }

    return {
      success: true as const,
      message: "You left the group.",
    };
  } catch (error) {
    console.error(
      "leaveGroupAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to leave group. Please try again.",
    };
  }
}

export async function createGroupPostAction(
  groupId: string,
  content: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in.",
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
        error:
          "Post cannot exceed 5000 characters.",
      };
    }

    const group = await db.group.findUnique({
      where: {
        id: groupId,
      },
      select: {
        id: true,
        slug: true,

        members: {
          where: {
            userId: currentUser.id,
          },
          select: {
            role: true,
          },
        },
      },
    });

    if (!group) {
      return {
        success: false as const,
        error: "Group not found.",
      };
    }

    const membership = group.members[0];

    if (!membership) {
      return {
        success: false as const,
        error:
          "You must be a group member to create posts.",
      };
    }

    const post = await db.post.create({
      data: {
        authorId: currentUser.id,
        groupId: group.id,
        content: cleanContent,
        visibility: "PUBLIC",
      },

      select: {
        id: true,
      },
    });

    revalidatePath(`/groups/${group.slug}`);
    revalidatePath("/groups");

    return {
      success: true as const,
      message: "Group post created successfully.",
      postId: post.id,
    };
  } catch (error) {
    console.error(
      "createGroupPostAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to create group post. Please try again.",
    };
  }
}

export async function getGroupMembersAction(
  groupId: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in.",
        members: [],
        canManage: false,
      };
    }

    const group = await db.group.findUnique({
      where: {
        id: groupId,
      },
      select: {
        id: true,

        members: {
          where: {
            userId: currentUser.id,
          },
          select: {
            role: true,
          },
        },
      },
    });

    if (!group) {
      return {
        success: false as const,
        error: "Group not found.",
        members: [],
        canManage: false,
      };
    }

    const members =
      await db.groupMember.findMany({
        where: {
          groupId,
        },
        orderBy: {
          joinedAt: "asc",
        },
        select: {
          role: true,
          joinedAt: true,

          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatarUrl: true,
              isVerified: true,
            },
          },
        },
      });

    return {
      success: true as const,
      members,
      canManage:
        group.members[0]?.role === "ADMIN",
    };
  } catch (error) {
    console.error(
      "getGroupMembersAction failed:",
      error,
    );

    return {
      success: false as const,
      error: "Failed to load group members.",
      members: [],
      canManage: false,
    };
  }
}

export async function updateGroupMemberRoleAction(
  groupId: string,
  userId: string,
  role: "MEMBER" | "MODERATOR",
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in.",
      };
    }

    const currentMembership =
      await db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: currentUser.id,
          },
        },
        select: {
          role: true,
        },
      });

    if (
      !currentMembership ||
      currentMembership.role !== "ADMIN"
    ) {
      return {
        success: false as const,
        error:
          "Only group admins can manage member roles.",
      };
    }

    const targetMembership =
      await db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
        select: {
          role: true,
        },
      });

    if (!targetMembership) {
      return {
        success: false as const,
        error: "Member not found.",
      };
    }

    if (targetMembership.role === "ADMIN") {
      return {
        success: false as const,
        error:
          "The group admin role cannot be changed.",
      };
    }

    await db.groupMember.update({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      data: {
        role,
      },
    });

    const group = await db.group.findUnique({
      where: {
        id: groupId,
      },
      select: {
        slug: true,
      },
    });

    if (group) {
      revalidatePath(
        `/groups/${group.slug}`,
      );
    }

    return {
      success: true as const,
      message:
        role === "MODERATOR"
          ? "Member promoted to moderator."
          : "Moderator changed to member.",
    };
  } catch (error) {
    console.error(
      "updateGroupMemberRoleAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to update member role.",
    };
  }
}

export async function removeGroupMemberAction(
  groupId: string,
  userId: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in.",
      };
    }

    const currentMembership =
      await db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: currentUser.id,
          },
        },
        select: {
          role: true,
        },
      });

    if (
      !currentMembership ||
      currentMembership.role !== "ADMIN"
    ) {
      return {
        success: false as const,
        error:
          "Only group admins can remove members.",
      };
    }

    if (userId === currentUser.id) {
      return {
        success: false as const,
        error:
          "You cannot remove yourself as admin.",
      };
    }

    const targetMembership =
      await db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
        select: {
          role: true,
        },
      });

    if (!targetMembership) {
      return {
        success: false as const,
        error: "Member not found.",
      };
    }

    if (targetMembership.role === "ADMIN") {
      return {
        success: false as const,
        error:
          "You cannot remove another group admin.",
      };
    }

    await db.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    const group = await db.group.findUnique({
      where: {
        id: groupId,
      },
      select: {
        slug: true,
      },
    });

    revalidatePath("/groups");

    if (group) {
      revalidatePath(
        `/groups/${group.slug}`,
      );
    }

    return {
      success: true as const,
      message:
        "Member removed from the group.",
    };
  } catch (error) {
    console.error(
      "removeGroupMemberAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to remove group member.",
    };
  }
}
"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createPageAction(
  name: string,
  category: string,
  description: string,
  website: string,
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

    const cleanName = name.trim();
    const cleanCategory =
      category.trim();
    const cleanDescription =
      description.trim();
    const cleanWebsite = website.trim();

    if (!cleanName) {
      return {
        success: false as const,
        error: "Page name is required.",
      };
    }

    if (cleanName.length < 2) {
      return {
        success: false as const,
        error:
          "Page name must be at least 2 characters.",
      };
    }

    if (cleanName.length > 100) {
      return {
        success: false as const,
        error:
          "Page name cannot exceed 100 characters.",
      };
    }

    if (!cleanCategory) {
      return {
        success: false as const,
        error: "Page category is required.",
      };
    }

    if (cleanCategory.length > 100) {
      return {
        success: false as const,
        error:
          "Page category cannot exceed 100 characters.",
      };
    }

    if (cleanDescription.length > 1000) {
      return {
        success: false as const,
        error:
          "Description cannot exceed 1000 characters.",
      };
    }

    if (cleanWebsite.length > 500) {
      return {
        success: false as const,
        error:
          "Website URL cannot exceed 500 characters.",
      };
    }

    if (cleanWebsite) {
      try {
        new URL(cleanWebsite);
      } catch {
        return {
          success: false as const,
          error:
            "Please enter a valid website URL.",
        };
      }
    }

    const baseSlug =
      createSlug(cleanName);

    if (!baseSlug) {
      return {
        success: false as const,
        error: "Invalid page name.",
      };
    }

    let slug = baseSlug;
    let counter = 2;

    while (
      await db.page.findUnique({
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

    const page =
      await db.page.create({
        data: {
          name: cleanName,
          slug,
          category: cleanCategory,
          description:
            cleanDescription || null,
          website:
            cleanWebsite || null,
          ownerId: currentUser.id,
        },

        select: {
          id: true,
          slug: true,
        },
      });

    revalidatePath("/pages");

    revalidatePath(
      `/pages/${page.slug}`,
    );

    revalidatePath(
      `/profile/${currentUser.username}`,
    );

    return {
      success: true as const,
      message:
        "Page created successfully.",
      pageId: page.id,
      slug: page.slug,
    };
  } catch (error) {
    console.error(
      "createPageAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to create page. Please try again.",
    };
  }
}

export async function updatePageAction(
  pageId: string,
  name: string,
  category: string,
  description: string,
  website: string,
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

    const cleanName = name.trim();
    const cleanCategory =
      category.trim();
    const cleanDescription =
      description.trim();
    const cleanWebsite = website.trim();

    if (!cleanName) {
      return {
        success: false as const,
        error: "Page name is required.",
      };
    }

    if (cleanName.length < 2) {
      return {
        success: false as const,
        error:
          "Page name must be at least 2 characters.",
      };
    }

    if (cleanName.length > 100) {
      return {
        success: false as const,
        error:
          "Page name cannot exceed 100 characters.",
      };
    }

    if (!cleanCategory) {
      return {
        success: false as const,
        error: "Page category is required.",
      };
    }

    if (cleanCategory.length > 100) {
      return {
        success: false as const,
        error:
          "Page category cannot exceed 100 characters.",
      };
    }

    if (cleanDescription.length > 1000) {
      return {
        success: false as const,
        error:
          "Description cannot exceed 1000 characters.",
      };
    }

    if (cleanWebsite.length > 500) {
      return {
        success: false as const,
        error:
          "Website URL cannot exceed 500 characters.",
      };
    }

    if (cleanWebsite) {
      try {
        new URL(cleanWebsite);
      } catch {
        return {
          success: false as const,
          error:
            "Please enter a valid website URL.",
        };
      }
    }

    const page =
      await db.page.findUnique({
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

    if (
      page.ownerId !==
      currentUser.id
    ) {
      return {
        success: false as const,
        error:
          "Only the page owner can edit this page.",
      };
    }

    await db.page.update({
      where: {
        id: pageId,
      },

      data: {
        name: cleanName,
        category: cleanCategory,
        description:
          cleanDescription || null,
        website:
          cleanWebsite || null,
      },
    });

    revalidatePath("/pages");

    revalidatePath(
      `/pages/${page.slug}`,
    );

    revalidatePath(
      `/profile/${currentUser.username}`,
    );

    return {
      success: true as const,
      message:
        "Page updated successfully.",
      slug: page.slug,
    };
  } catch (error) {
    console.error(
      "updatePageAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to update page. Please try again.",
    };
  }
}

export async function followPageAction(
  pageId: string,
) {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        following: false,
        error:
          "You must be logged in.",
      };
    }

    const page =
      await db.page.findUnique({
        where: {
          id: pageId,
        },

        select: {
          id: true,
          slug: true,
        },
      });

    if (!page) {
      return {
        success: false as const,
        following: false,
        error: "Page not found.",
      };
    }

    const existingFollow =
      await db.pageFollower.findUnique({
        where: {
          pageId_userId: {
            pageId,
            userId: currentUser.id,
          },
        },

        select: {
          pageId: true,
        },
      });

    if (existingFollow) {
      return {
        success: false as const,
        following: true,
        error:
          "You already follow this page.",
      };
    }

    await db.pageFollower.create({
      data: {
        pageId,
        userId: currentUser.id,
      },
    });

    revalidatePath("/pages");

    revalidatePath(
      `/pages/${page.slug}`,
    );

    return {
      success: true as const,
      following: true,
      message:
        "Page followed successfully.",
    };
  } catch (error) {
    console.error(
      "followPageAction failed:",
      error,
    );

    return {
      success: false as const,
      following: false,
      error:
        "Failed to follow page. Please try again.",
    };
  }
}

export async function unfollowPageAction(
  pageId: string,
) {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        following: true,
        error:
          "You must be logged in.",
      };
    }

    const page =
      await db.page.findUnique({
        where: {
          id: pageId,
        },

        select: {
          id: true,
          slug: true,
        },
      });

    if (!page) {
      return {
        success: false as const,
        following: true,
        error: "Page not found.",
      };
    }

    const existingFollow =
      await db.pageFollower.findUnique({
        where: {
          pageId_userId: {
            pageId,
            userId: currentUser.id,
          },
        },

        select: {
          pageId: true,
        },
      });

    if (!existingFollow) {
      return {
        success: false as const,
        following: false,
        error:
          "You are not following this page.",
      };
    }

    await db.pageFollower.delete({
      where: {
        pageId_userId: {
          pageId,
          userId: currentUser.id,
        },
      },
    });

    revalidatePath("/pages");

    revalidatePath(
      `/pages/${page.slug}`,
    );

    return {
      success: true as const,
      following: false,
      message:
        "Page unfollowed successfully.",
    };
  } catch (error) {
    console.error(
      "unfollowPageAction failed:",
      error,
    );

    return {
      success: false as const,
      following: true,
      error:
        "Failed to unfollow page. Please try again.",
    };
  }
}

export async function togglePageFollowAction(
  pageId: string,
) {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        following: false,
        error:
          "You must be logged in.",
      };
    }

    const page =
      await db.page.findUnique({
        where: {
          id: pageId,
        },

        select: {
          id: true,
          slug: true,
        },
      });

    if (!page) {
      return {
        success: false as const,
        following: false,
        error: "Page not found.",
      };
    }

    const existingFollow =
      await db.pageFollower.findUnique({
        where: {
          pageId_userId: {
            pageId,
            userId: currentUser.id,
          },
        },

        select: {
          pageId: true,
        },
      });

    if (existingFollow) {
      await db.pageFollower.delete({
        where: {
          pageId_userId: {
            pageId,
            userId: currentUser.id,
          },
        },
      });

      revalidatePath("/pages");

      revalidatePath(
        `/pages/${page.slug}`,
      );

      return {
        success: true as const,
        following: false,
        message:
          "Page unfollowed successfully.",
      };
    }

    await db.pageFollower.create({
      data: {
        pageId,
        userId: currentUser.id,
      },
    });

    revalidatePath("/pages");

    revalidatePath(
      `/pages/${page.slug}`,
    );

    return {
      success: true as const,
      following: true,
      message:
        "Page followed successfully.",
    };
  } catch (error) {
    console.error(
      "togglePageFollowAction failed:",
      error,
    );

    return {
      success: false as const,
      following: false,
      error:
        "Failed to update page follow status.",
    };
  }
}

export async function deletePageAction(
  pageId: string,
) {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error:
          "You must be logged in.",
      };
    }

    const page =
      await db.page.findUnique({
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

    if (
      page.ownerId !==
      currentUser.id
    ) {
      return {
        success: false as const,
        error:
          "Only the page owner can delete this page.",
      };
    }

    await db.page.delete({
      where: {
        id: pageId,
      },
    });

    revalidatePath("/pages");

    revalidatePath(
      `/profile/${currentUser.username}`,
    );

    return {
      success: true as const,
      message:
        "Page deleted successfully.",
    };
  } catch (error) {
    console.error(
      "deletePageAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to delete page. Please try again.",
    };
  }
}
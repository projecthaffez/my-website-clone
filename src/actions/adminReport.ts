"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireModerator() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false as const,
      error: "You must be logged in.",
      user: null,
    };
  }

  if (
    currentUser.role !== "ADMIN" &&
    currentUser.role !== "MODERATOR"
  ) {
    return {
      success: false as const,
      error: "You do not have permission to access moderation.",
      user: null,
    };
  }

  return {
    success: true as const,
    user: currentUser,
  };
}

export async function getAdminReportsAction() {
  try {
    const auth = await requireModerator();

    if (!auth.success) {
      return {
        success: false as const,
        error: auth.error,
        reports: [],
      };
    }

    const reports = await db.report.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 100,

      select: {
        id: true,
        targetType: true,
        targetId: true,
        reason: true,
        details: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        reporter: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      success: true as const,
      reports,
    };
  } catch (error) {
    console.error(
      "getAdminReportsAction failed:",
      error,
    );

    return {
      success: false as const,
      error: "Failed to load reports.",
      reports: [],
    };
  }
}

export async function updateReportStatusAction(
  reportId: string,
  status:
    | "PENDING"
    | "REVIEWED"
    | "DISMISSED"
    | "RESOLVED",
) {
  try {
    const auth = await requireModerator();

    if (!auth.success) {
      return {
        success: false as const,
        error: auth.error,
      };
    }

    const report =
      await db.report.findUnique({
        where: {
          id: reportId,
        },

        select: {
          id: true,
        },
      });

    if (!report) {
      return {
        success: false as const,
        error: "Report not found.",
      };
    }

    await db.report.update({
      where: {
        id: reportId,
      },

      data: {
        status,
      },
    });

    revalidatePath("/admin/reports");

    return {
      success: true as const,
      message: "Report status updated successfully.",
    };
  } catch (error) {
    console.error(
      "updateReportStatusAction failed:",
      error,
    );

    return {
      success: false as const,
      error: "Failed to update report status.",
    };
  }
}

export async function deleteReportAction(
  reportId: string,
) {
  try {
    const auth = await requireModerator();

    if (!auth.success) {
      return {
        success: false as const,
        error: auth.error,
      };
    }

    const report =
      await db.report.findUnique({
        where: {
          id: reportId,
        },

        select: {
          id: true,
        },
      });

    if (!report) {
      return {
        success: false as const,
        error: "Report not found.",
      };
    }

    await db.report.delete({
      where: {
        id: reportId,
      },
    });

    revalidatePath("/admin/reports");

    return {
      success: true as const,
      message: "Report deleted successfully.",
    };
  } catch (error) {
    console.error(
      "deleteReportAction failed:",
      error,
    );

    return {
      success: false as const,
      error: "Failed to delete report.",
    };
  }
}

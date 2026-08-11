"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const reportSchema = z.object({
  targetType: z.enum([
    "USER",
    "POST",
    "COMMENT",
    "GROUP",
    "PAGE",
  ]),
  targetId: z.string().trim().min(1),
  reason: z
    .string()
    .trim()
    .min(3, "Please provide a valid reason.")
    .max(100),
  details: z
    .string()
    .trim()
    .max(1000)
    .optional(),
});

export type CreateReportInput =
  z.infer<typeof reportSchema>;

export async function createReportAction(
  input: CreateReportInput,
) {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in to report content.",
      };
    }

    const validated =
      reportSchema.parse(input);

    if (
      validated.targetType === "USER" &&
      validated.targetId === currentUser.id
    ) {
      return {
        success: false as const,
        error: "You cannot report yourself.",
      };
    }

    /*
     * Verify that the target exists before
     * creating the report.
     */
    let targetExists = false;

    switch (validated.targetType) {
      case "USER": {
        const user =
          await db.user.findUnique({
            where: {
              id: validated.targetId,
            },
            select: {
              id: true,
            },
          });

        targetExists = !!user;
        break;
      }

      case "POST": {
        const post =
          await db.post.findUnique({
            where: {
              id: validated.targetId,
            },
            select: {
              id: true,
              isDeleted: true,
            },
          });

        targetExists =
          !!post && !post.isDeleted;
        break;
      }

      case "COMMENT": {
        const comment =
          await db.comment.findUnique({
            where: {
              id: validated.targetId,
            },
            select: {
              id: true,
            },
          });

        targetExists = !!comment;
        break;
      }

      case "GROUP": {
        const group =
          await db.group.findUnique({
            where: {
              id: validated.targetId,
            },
            select: {
              id: true,
            },
          });

        targetExists = !!group;
        break;
      }

      case "PAGE": {
        const page =
          await db.page.findUnique({
            where: {
              id: validated.targetId,
            },
            select: {
              id: true,
            },
          });

        targetExists = !!page;
        break;
      }
    }

    if (!targetExists) {
      return {
        success: false as const,
        error: "The reported item could not be found.",
      };
    }

    /*
     * Prevent duplicate pending reports
     * from the same user for the same target.
     */
    const existingReport =
      await db.report.findFirst({
        where: {
          reporterId: currentUser.id,
          targetType: validated.targetType,
          targetId: validated.targetId,
          status: "PENDING",
        },
        select: {
          id: true,
        },
      });

    if (existingReport) {
      return {
        success: false as const,
        error:
          "You have already reported this item.",
      };
    }

    const report =
      await db.report.create({
        data: {
          reporterId: currentUser.id,
          targetType:
            validated.targetType,
          targetId:
            validated.targetId,
          reason: validated.reason,
          details:
            validated.details || null,
          status: "PENDING",
        },
        select: {
          id: true,
        },
      });

    revalidatePath("/");

    return {
      success: true as const,
      message:
        "Report submitted successfully.",
      reportId: report.id,
    };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        error:
          error.issues[0]?.message ??
          "Invalid report information.",
      };
    }

    console.error(
      "createReportAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to submit report. Please try again.",
    };
  }
}
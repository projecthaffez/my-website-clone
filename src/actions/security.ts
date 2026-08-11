"use server";

import { db } from "@/lib/db";
import {
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(
        8,
        "New password must be at least 8 characters.",
      )
      .max(
        100,
        "New password is too long.",
      ),
    confirmPassword: z
      .string()
      .min(
        1,
        "Please confirm your new password.",
      ),
  })
  .refine(
    (data) =>
      data.newPassword ===
      data.confirmPassword,
    {
      message:
        "New passwords do not match.",
      path: ["confirmPassword"],
    },
  );

export type ChangePasswordInput =
  z.infer<typeof changePasswordSchema>;

export async function changePasswordAction(
  input: ChangePasswordInput,
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

    const validated =
      changePasswordSchema.parse(input);

    const user =
      await db.user.findUnique({
        where: {
          id: currentUser.id,
        },
        select: {
          id: true,
          passwordHash: true,
        },
      });

    if (!user) {
      return {
        success: false as const,
        error: "User not found.",
      };
    }

    const validCurrentPassword =
      await verifyPassword(
        validated.currentPassword,
        user.passwordHash,
      );

    if (!validCurrentPassword) {
      return {
        success: false as const,
        error:
          "Current password is incorrect.",
      };
    }

    const samePassword =
      await verifyPassword(
        validated.newPassword,
        user.passwordHash,
      );

    if (samePassword) {
      return {
        success: false as const,
        error:
          "New password must be different from your current password.",
      };
    }

    const passwordHash =
      await hashPassword(
        validated.newPassword,
      );

    await db.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        passwordHash,
      },
    });

    await db.session.deleteMany({
      where: {
        userId: currentUser.id,
      },
    });

    revalidatePath(
      "/settings/security",
    );

    return {
      success: true as const,
      message:
        "Password changed successfully. Please log in again.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        error:
          error.issues[0]?.message ??
          "Invalid password details.",
      };
    }

    console.error(
      "changePasswordAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to change password. Please try again.",
    };
  }
}

export async function logoutAllSessionsAction() {
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

    await db.session.deleteMany({
      where: {
        userId: currentUser.id,
      },
    });

    return {
      success: true as const,
      message:
        "All sessions have been logged out.",
    };
  } catch (error) {
    console.error(
      "logoutAllSessionsAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to log out sessions.",
    };
  }
}
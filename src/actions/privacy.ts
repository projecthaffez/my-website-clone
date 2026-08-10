"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const privacySchema = z.object({
  profileVisibility: z.enum([
    "PUBLIC",
    "FRIENDS",
    "PRIVATE",
  ]),
  allowFriendRequests: z.boolean(),
  allowMessages: z.boolean(),
});

export type PrivacySettingsInput =
  z.infer<typeof privacySchema>;

export async function updatePrivacySettingsAction(
  input: PrivacySettingsInput,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: "You must be logged in to update privacy settings.",
      };
    }

    const validated = privacySchema.parse(input);

    await db.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        profileVisibility: validated.profileVisibility,
        allowFriendRequests: validated.allowFriendRequests,
        allowMessages: validated.allowMessages,
      },
    });

    revalidatePath("/");
    revalidatePath(`/profile/${currentUser.username}`);
    revalidatePath("/settings/privacy");

    return {
      success: true as const,
      message: "Privacy settings updated successfully.",
    };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        error:
          error.issues[0]?.message ??
          "Invalid privacy settings.",
      };
    }

    console.error(
      "updatePrivacySettingsAction failed:",
      error,
    );

    return {
      success: false as const,
      error:
        "Failed to update privacy settings. Please try again.",
    };
  }
}
'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.'),
  bio: z.string().trim().max(500),
  location: z.string().trim().max(100),
  website: z
    .string()
    .trim()
    .max(255)
    .refine(
      (value) => value === '' || /^https?:\/\/.+/i.test(value),
      'Website must start with http:// or https://.',
    ),
  avatarUrl: z.string().trim().max(1000),
  coverUrl: z.string().trim().max(1000),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function updateProfileAction(
  input: UpdateProfileInput,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false as const,
        error: 'You must be logged in to update your profile.',
      };
    }

    const validated = updateProfileSchema.parse(input);

    const username = validated.username.toLowerCase();

    const existingUsername = await db.user.findFirst({
      where: {
        username,
        NOT: {
          id: currentUser.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingUsername) {
      return {
        success: false as const,
        error: 'This username is already taken.',
      };
    }

    await db.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name: validated.name,
        username,
        bio: validated.bio || null,
        location: validated.location || null,
        website: validated.website || null,
        avatarUrl: validated.avatarUrl || null,
        coverUrl: validated.coverUrl || null,
      },
    });

    revalidatePath('/');
    revalidatePath(`/profile/${currentUser.username}`);
    revalidatePath(`/profile/${username}`);
    revalidatePath('/settings/profile');

    return {
      success: true as const,
      message: 'Profile updated successfully.',
    };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        error: error.issues[0]?.message ?? 'Invalid profile information.',
      };
    }

    console.error('updateProfileAction failed:', error);

    return {
      success: false as const,
      error: 'Failed to update profile. Please try again.',
    };
  }
}
'use server';

import { db } from '@/lib/db';
import { hashPassword, verifyPassword, createSession, destroySession } from '@/lib/auth';
import {
  registerSchema,
  loginSchema,
  requestResetSchema,
  resetPasswordSchema,
  RegisterInput,
  LoginInput,
  RequestResetInput,
  ResetPasswordInput,
} from '@/lib/validations/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type ActionResult<T = unknown> =
  | { success: true; message?: string; data?: T }
  | { success: false; error: string };

export async function registerUserAction(input: RegisterInput): Promise<ActionResult> {
  try {
    const validated = registerSchema.parse(input);

    // Check email uniqueness
    const existingEmail = await db.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });
    if (existingEmail) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // Check username uniqueness
    const existingUsername = await db.user.findUnique({
      where: { username: validated.username.toLowerCase() },
    });
    if (existingUsername) {
      return { success: false, error: 'This username is already taken.' };
    }

    // Hash password
    const passwordHash = await hashPassword(validated.password);

    // Create User
    const user = await db.user.create({
      data: {
        name: validated.name,
        username: validated.username.toLowerCase(),
        email: validated.email.toLowerCase(),
        passwordHash,
        avatarUrl: '/default-avatar.svg',
        coverUrl: '/default-cover.svg',
      },
    });

    // Create session
    await createSession(user.id);

    return { success: true, message: 'Account created successfully!' };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to create account. Please try again.' };
  }
}

export async function loginUserAction(input: LoginInput): Promise<ActionResult> {
  try {
    const validated = loginSchema.parse(input);

    const term = validated.emailOrUsername.toLowerCase();
    const user = await db.user.findFirst({
      where: {
        OR: [{ email: term }, { username: term }],
      },
    });

    if (!user) {
      return { success: false, error: 'Invalid credentials. User not found.' };
    }

    if (user.isBanned) {
      return { success: false, error: 'This account has been suspended. Please contact support.' };
    }

    const isValid = await verifyPassword(validated.password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid credentials. Password incorrect.' };
    }

    await createSession(user.id);

    return { success: true, message: 'Logged in successfully!' };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

export async function logoutUserAction(): Promise<void> {
  await destroySession();
  revalidatePath('/');
  redirect('/login');
}

export async function requestPasswordResetAction(input: RequestResetInput): Promise<ActionResult> {
  try {
    const validated = requestResetSchema.parse(input);
    const user = await db.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (!user) {
      // Return success to avoid email enumeration attacks
      return { success: true, message: 'If an account exists, a reset link has been dispatched.' };
    }

    // Create token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expiresAt,
      },
    });

    return { success: true, message: `Reset token created. Demo Token: ${token}` };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to process password reset request.' };
  }
}

export async function resetPasswordAction(input: ResetPasswordInput): Promise<ActionResult> {
  try {
    const validated = resetPasswordSchema.parse(input);

    const resetRecord = await db.verificationToken.findUnique({
      where: { token: validated.token },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return { success: false, error: 'Invalid or expired password reset token.' };
    }

    const passwordHash = await hashPassword(validated.password);

    await db.user.update({
      where: { email: resetRecord.identifier },
      data: { passwordHash },
    });

    await db.verificationToken.delete({
      where: { token: validated.token },
    });

    return { success: true, message: 'Password reset successfully. You may now log in.' };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to reset password.' };
  }
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  changePasswordAction,
  type ChangePasswordInput,
} from "@/actions/security";

export function SecurityForm() {
  const router = useRouter();

  const [form, setForm] =
    useState<ChangePasswordInput>({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  function updateField(
    field: keyof ChangePasswordInput,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const result =
      await changePasswordAction(form);

    setSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setMessage(
      result.message ??
        "Password changed successfully.",
    );

    setForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1500);
  }

  return (
    <div className="space-y-8">
      {/* Change Password */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <h2 className="text-lg font-semibold text-white">
            Change Password
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Use a strong password that you do
            not use on other websites.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {/* Current Password */}
        <div>
          <label
            htmlFor="currentPassword"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Current Password
          </label>

          <input
            id="currentPassword"
            type="password"
            value={form.currentPassword}
            onChange={(event) =>
              updateField(
                "currentPassword",
                event.target.value,
              )
            }
            autoComplete="current-password"
            required
            disabled={saving}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="newPassword"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            New Password
          </label>

          <input
            id="newPassword"
            type="password"
            value={form.newPassword}
            onChange={(event) =>
              updateField(
                "newPassword",
                event.target.value,
              )
            }
            autoComplete="new-password"
            minLength={8}
            maxLength={100}
            required
            disabled={saving}
            placeholder="At least 8 characters"
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <p className="mt-2 text-xs text-slate-500">
            Password must be at least 8
            characters long.
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Confirm New Password
          </label>

          <input
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={(event) =>
              updateField(
                "confirmPassword",
                event.target.value,
              )
            }
            autoComplete="new-password"
            minLength={8}
            maxLength={100}
            required
            disabled={saving}
            placeholder="Enter the new password again"
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {/* Save */}
        <div className="border-t border-white/10 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Changing Password..."
              : "Change Password"}
          </button>
        </div>
      </form>

      {/* Security Information */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
        <h2 className="font-semibold text-white">
          Security Information
        </h2>

        <div className="mt-4 space-y-3 text-sm text-slate-400">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-emerald-400">
              ✓
            </span>

            <p>
              Your password is securely hashed
              before it is stored.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-emerald-400">
              ✓
            </span>

            <p>
              Changing your password signs you
              out of your existing sessions.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-emerald-400">
              ✓
            </span>

            <p>
              Never share your password with
              anyone.
            </p>
          </div>
        </div>
      </div>

      {/* Back */}
      <button
        type="button"
        disabled={saving}
        onClick={() => router.back()}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        Back
      </button>
    </div>
  );
}
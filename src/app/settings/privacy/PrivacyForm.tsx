"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  updatePrivacySettingsAction,
  type PrivacySettingsInput,
} from "@/actions/privacy";

interface PrivacyFormProps {
  initialData: PrivacySettingsInput;
}

export function PrivacyForm({
  initialData,
}: PrivacyFormProps) {
  const router = useRouter();

  const [form, setForm] =
    useState<PrivacySettingsInput>(
      initialData,
    );

  const [savedForm, setSavedForm] =
    useState<PrivacySettingsInput>(
      initialData,
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const hasChanges = useMemo(() => {
    return (
      form.profileVisibility !==
        savedForm.profileVisibility ||
      form.allowFriendRequests !==
        savedForm.allowFriendRequests ||
      form.allowMessages !==
        savedForm.allowMessages
    );
  }, [form, savedForm]);

  function updateForm(
    changes: Partial<PrivacySettingsInput>,
  ) {
    setForm((current) => ({
      ...current,
      ...changes,
    }));

    setError("");
    setMessage("");
  }

  function handleReset() {
    if (saving) {
      return;
    }

    setForm(savedForm);
    setError("");
    setMessage("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const result =
        await updatePrivacySettingsAction(
          form,
        );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSavedForm(form);

      setMessage(
        result.message ??
          "Privacy settings updated successfully.",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "PrivacyForm submit failed:",
        error,
      );

      setError(
        "Failed to update privacy settings. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
        >
          {message}
        </div>
      )}

      {/* Profile Visibility */}
      <div>
        <label
          htmlFor="profileVisibility"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Profile Visibility
        </label>

        <select
          id="profileVisibility"
          value={form.profileVisibility}
          onChange={(event) =>
            updateForm({
              profileVisibility:
                event.target
                  .value as PrivacySettingsInput["profileVisibility"],
            })
          }
          disabled={saving}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="PUBLIC">
            Public
          </option>

          <option value="FRIENDS">
            Friends Only
          </option>

          <option value="PRIVATE">
            Private
          </option>
        </select>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Public: anyone can view your
          profile. Friends Only: only
          accepted friends can view your
          profile. Private: your profile is
          hidden from other users.
        </p>
      </div>

      {/* Friend Requests */}
      <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-white">
              Friend Requests
            </h2>

            <p className="mt-1 text-sm leading-5 text-slate-400">
              Allow other users to send you
              friend requests.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-label="Allow friend requests"
            aria-checked={
              form.allowFriendRequests
            }
            onClick={() =>
              updateForm({
                allowFriendRequests:
                  !form.allowFriendRequests,
              })
            }
            disabled={saving}
            className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
              form.allowFriendRequests
                ? "bg-blue-600"
                : "bg-slate-700"
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                form.allowFriendRequests
                  ? "left-6"
                  : "left-1"
              }`}
            />
          </button>
        </div>

        <div className="mt-3">
          <span
            className={`text-xs font-medium ${
              form.allowFriendRequests
                ? "text-blue-400"
                : "text-slate-500"
            }`}
          >
            {form.allowFriendRequests
              ? "Allowed"
              : "Not allowed"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-white">
              Messages
            </h2>

            <p className="mt-1 text-sm leading-5 text-slate-400">
              Allow other users to send you
              messages.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-label="Allow messages"
            aria-checked={
              form.allowMessages
            }
            onClick={() =>
              updateForm({
                allowMessages:
                  !form.allowMessages,
              })
            }
            disabled={saving}
            className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
              form.allowMessages
                ? "bg-blue-600"
                : "bg-slate-700"
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                form.allowMessages
                  ? "left-6"
                  : "left-1"
              }`}
            />
          </button>
        </div>

        <div className="mt-3">
          <span
            className={`text-xs font-medium ${
              form.allowMessages
                ? "text-blue-400"
                : "text-slate-500"
            }`}
          >
            {form.allowMessages
              ? "Allowed"
              : "Not allowed"}
          </span>
        </div>
      </div>

      {/* Save */}
      <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
        {hasChanges && (
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset Changes
          </button>
        )}

        <button
          type="submit"
          disabled={saving || !hasChanges}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : hasChanges
              ? "Save Privacy Settings"
              : "No Changes"}
        </button>
      </div>
    </form>
  );
}
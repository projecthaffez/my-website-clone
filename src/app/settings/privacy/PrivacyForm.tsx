"use client";

import { useState } from "react";
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

  const [form, setForm] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const result =
      await updatePrivacySettingsAction(form);

    setSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setMessage(
      result.message ??
        "Privacy settings updated successfully.",
    );

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
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
            setForm((current) => ({
              ...current,
              profileVisibility:
                event.target.value as PrivacySettingsInput["profileVisibility"],
            }))
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

        <p className="mt-2 text-xs text-slate-500">
          Public: anyone can view your profile.
          Friends Only: only accepted friends can view
          your profile. Private: your profile is hidden
          from other users.
        </p>
      </div>

      {/* Friend Requests */}
      <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-white">
              Friend Requests
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Allow other users to send you friend
              requests.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={
              form.allowFriendRequests
            }
            onClick={() =>
              setForm((current) => ({
                ...current,
                allowFriendRequests:
                  !current.allowFriendRequests,
              }))
            }
            disabled={saving}
            className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
              form.allowFriendRequests
                ? "bg-blue-600"
                : "bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                form.allowFriendRequests
                  ? "left-6"
                  : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-white">
              Messages
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Allow other users to send you messages.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={form.allowMessages}
            onClick={() =>
              setForm((current) => ({
                ...current,
                allowMessages:
                  !current.allowMessages,
              }))
            }
            disabled={saving}
            className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
              form.allowMessages
                ? "bg-blue-600"
                : "bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                form.allowMessages
                  ? "left-6"
                  : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="border-t border-white/10 pt-6">
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? "Saving..."
            : "Save Privacy Settings"}
        </button>
      </div>
    </form>
  );
}
"use client";

import {
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  updateProfileAction,
  type UpdateProfileInput,
} from "@/actions/profile";

interface ProfileFormProps {
  initialData: UpdateProfileInput;
}

export function ProfileForm({
  initialData,
}: ProfileFormProps) {
  const router = useRouter();

  const [form, setForm] =
    useState<UpdateProfileInput>(
      initialData,
    );

  const [savedForm, setSavedForm] =
    useState<UpdateProfileInput>(
      initialData,
    );

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const hasChanges = useMemo(() => {
    return (
      form.name !== savedForm.name ||
      form.username !==
        savedForm.username ||
      form.bio !== savedForm.bio ||
      form.location !==
        savedForm.location ||
      form.website !==
        savedForm.website ||
      form.avatarUrl !==
        savedForm.avatarUrl ||
      form.coverUrl !==
        savedForm.coverUrl
    );
  }, [form, savedForm]);

  function updateField(
    field: keyof UpdateProfileInput,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
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
        await updateProfileAction(form);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSavedForm(form);

      setMessage(
        result.message ??
          "Profile updated successfully.",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "ProfileForm submit failed:",
        error,
      );

      setError(
        "Failed to update profile. Please try again.",
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

      {/* Full Name */}
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Full Name
        </label>

        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(event) =>
            updateField(
              "name",
              event.target.value,
            )
          }
          required
          maxLength={80}
          disabled={saving}
          autoComplete="name"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <p className="mt-1 text-right text-xs text-slate-600">
          {form.name.length}/80
        </p>
      </div>

      {/* Username */}
      <div>
        <label
          htmlFor="username"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Username
        </label>

        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
            @
          </span>

          <input
            id="username"
            type="text"
            value={form.username}
            onChange={(event) =>
              updateField(
                "username",
                event.target.value,
              )
            }
            required
            minLength={3}
            maxLength={30}
            disabled={saving}
            autoComplete="username"
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 pl-9 text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <p className="mt-2 text-xs text-slate-500">
          Only letters, numbers, and
          underscores are allowed.
        </p>

        <p className="mt-1 text-right text-xs text-slate-600">
          {form.username.length}/30
        </p>
      </div>

      {/* Bio */}
      <div>
        <label
          htmlFor="bio"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Bio
        </label>

        <textarea
          id="bio"
          value={form.bio}
          onChange={(event) =>
            updateField(
              "bio",
              event.target.value,
            )
          }
          maxLength={500}
          rows={4}
          disabled={saving}
          placeholder="Tell people a little about yourself..."
          className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <p className="mt-1 text-right text-xs text-slate-600">
          {form.bio.length}/500
        </p>
      </div>

      {/* Location */}
      <div>
        <label
          htmlFor="location"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Location
        </label>

        <input
          id="location"
          type="text"
          value={form.location}
          onChange={(event) =>
            updateField(
              "location",
              event.target.value,
            )
          }
          maxLength={100}
          disabled={saving}
          autoComplete="address-level2"
          placeholder="e.g. Lahore, Pakistan"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <p className="mt-1 text-right text-xs text-slate-600">
          {form.location.length}/100
        </p>
      </div>

      {/* Website */}
      <div>
        <label
          htmlFor="website"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Website
        </label>

        <input
          id="website"
          type="url"
          value={form.website}
          onChange={(event) =>
            updateField(
              "website",
              event.target.value,
            )
          }
          maxLength={255}
          disabled={saving}
          placeholder="https://example.com"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <p className="mt-1 text-right text-xs text-slate-600">
          {form.website.length}/255
        </p>
      </div>

      {/* Avatar */}
      <div>
        <label
          htmlFor="avatarUrl"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Profile Image URL
        </label>

        <input
          id="avatarUrl"
          type="url"
          value={form.avatarUrl}
          onChange={(event) =>
            updateField(
              "avatarUrl",
              event.target.value,
            )
          }
          maxLength={1000}
          disabled={saving}
          placeholder="https://example.com/profile.jpg"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <p className="mt-1 text-xs text-slate-600">
          Use a publicly accessible image
          URL.
        </p>
      </div>

      {/* Cover */}
      <div>
        <label
          htmlFor="coverUrl"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Cover Image URL
        </label>

        <input
          id="coverUrl"
          type="url"
          value={form.coverUrl}
          onChange={(event) =>
            updateField(
              "coverUrl",
              event.target.value,
            )
          }
          maxLength={1000}
          disabled={saving}
          placeholder="https://example.com/cover.jpg"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <p className="mt-1 text-xs text-slate-600">
          Use a publicly accessible image
          URL.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
        {hasChanges && (
          <button
            type="button"
            disabled={saving}
            onClick={handleReset}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset Changes
          </button>
        )}

        <button
          type="button"
          disabled={saving}
          onClick={() => router.back()}
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            saving ||
            !hasChanges ||
            !form.name.trim() ||
            !form.username.trim()
          }
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : hasChanges
              ? "Save Changes"
              : "No Changes"}
        </button>
      </div>
    </form>
  );
}
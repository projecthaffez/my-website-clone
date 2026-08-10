"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateProfileAction,
  type UpdateProfileInput,
} from "@/actions/profile";

interface ProfileFormProps {
  initialData: UpdateProfileInput;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<UpdateProfileInput>(initialData);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function updateField(
    field: keyof UpdateProfileInput,
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

    const result = await updateProfileAction(form);

    setSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setMessage(result.message ?? "Profile updated successfully.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            updateField("name", event.target.value)
          }
          required
          maxLength={80}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="username"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Username
        </label>

        <input
          id="username"
          type="text"
          value={form.username}
          onChange={(event) =>
            updateField("username", event.target.value)
          }
          required
          minLength={3}
          maxLength={30}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
        />

        <p className="mt-2 text-xs text-slate-500">
          Only letters, numbers, and underscores are allowed.
        </p>
      </div>

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
            updateField("bio", event.target.value)
          }
          maxLength={500}
          rows={4}
          placeholder="Tell people a little about yourself..."
          className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
        />

        <p className="mt-2 text-right text-xs text-slate-500">
          {form.bio.length}/500
        </p>
      </div>

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
            updateField("location", event.target.value)
          }
          maxLength={100}
          placeholder="e.g. Lahore, Pakistan"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
        />
      </div>

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
            updateField("website", event.target.value)
          }
          maxLength={255}
          placeholder="https://example.com"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
        />
      </div>

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
            updateField("avatarUrl", event.target.value)
          }
          maxLength={1000}
          placeholder="https://example.com/profile.jpg"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
        />
      </div>

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
            updateField("coverUrl", event.target.value)
          }
          maxLength={1000}
          placeholder="https://example.com/cover.jpg"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={() => router.back()}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
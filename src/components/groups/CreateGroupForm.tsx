"use client";

import {
  FormEvent,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { createGroupAction } from "@/actions/group";

export function CreateGroupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [privacy, setPrivacy] = useState<
    "PUBLIC" | "PRIVATE"
  >("PUBLIC");

  const [error, setError] = useState("");
  const [isPending, startTransition] =
    useTransition();

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    const cleanName = name.trim();
    const cleanDescription =
      description.trim();

    if (!cleanName) {
      setError("Group name is required.");
      return;
    }

    if (cleanName.length < 3) {
      setError(
        "Group name must be at least 3 characters.",
      );
      return;
    }

    startTransition(async () => {
      const result =
        await createGroupAction(
          cleanName,
          cleanDescription,
          privacy,
        );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setName("");
      setDescription("");
      setPrivacy("PUBLIC");

      router.push(
        `/groups/${result.slug}`,
      );
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* Group Name */}
      <div>
        <label
          htmlFor="group-name"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Group name
        </label>

        <input
          id="group-name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="e.g. Web Developers"
          maxLength={100}
          disabled={isPending}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 disabled:opacity-50"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="group-description"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Description
        </label>

        <textarea
          id="group-description"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          placeholder="What is this community about?"
          rows={4}
          maxLength={1000}
          disabled={isPending}
          className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 disabled:opacity-50"
        />

        <div className="mt-1 text-right text-xs text-slate-600">
          {description.length}/1000
        </div>
      </div>

      {/* Privacy */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Privacy
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              setPrivacy("PUBLIC")
            }
            disabled={isPending}
            className={`rounded-xl border p-4 text-left transition ${
              privacy === "PUBLIC"
                ? "border-blue-500/40 bg-blue-500/10"
                : "border-white/10 bg-slate-950 hover:bg-white/5"
            }`}
          >
            <div className="font-semibold">
              🌎 Public
            </div>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Anyone can discover and join this
              group.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              setPrivacy("PRIVATE")
            }
            disabled={isPending}
            className={`rounded-xl border p-4 text-left transition ${
              privacy === "PRIVATE"
                ? "border-blue-500/40 bg-blue-500/10"
                : "border-white/10 bg-slate-950 hover:bg-white/5"
            }`}
          >
            <div className="font-semibold">
              🔒 Private
            </div>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Membership is restricted to approved
              members.
            </p>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={
            isPending || !name.trim()
          }
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? "Creating..."
            : "Create Group"}
        </button>
      </div>
    </form>
  );
}
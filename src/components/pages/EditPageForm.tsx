"use client";

import { useState } from "react";
import { updatePageAction } from "@/actions/page";

interface EditPageFormProps {
  pageId: string;
  initialName: string;
  initialCategory: string;
  initialDescription: string;
  initialWebsite: string;
  onUpdated?: () => void;
}

export function EditPageForm({
  pageId,
  initialName,
  initialCategory,
  initialDescription,
  initialWebsite,
  onUpdated,
}: EditPageFormProps) {
  const [name, setName] =
    useState(initialName);
  const [category, setCategory] =
    useState(initialCategory);
  const [description, setDescription] =
    useState(initialDescription);
  const [website, setWebsite] =
    useState(initialWebsite);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanCategory =
      category.trim();
    const cleanDescription =
      description.trim();
    const cleanWebsite =
      website.trim();

    if (!cleanName) {
      setError(
        "Page name is required.",
      );
      return;
    }

    if (cleanName.length < 2) {
      setError(
        "Page name must be at least 2 characters.",
      );
      return;
    }

    if (cleanName.length > 100) {
      setError(
        "Page name cannot exceed 100 characters.",
      );
      return;
    }

    if (!cleanCategory) {
      setError(
        "Page category is required.",
      );
      return;
    }

    if (cleanCategory.length > 100) {
      setError(
        "Page category cannot exceed 100 characters.",
      );
      return;
    }

    if (cleanDescription.length > 1000) {
      setError(
        "Description cannot exceed 1000 characters.",
      );
      return;
    }

    if (cleanWebsite.length > 500) {
      setError(
        "Website URL cannot exceed 500 characters.",
      );
      return;
    }

    setLoading(true);

    try {
      const result =
        await updatePageAction(
          pageId,
          cleanName,
          cleanCategory,
          cleanDescription,
          cleanWebsite,
        );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess(
        "Page updated successfully.",
      );

      setName(cleanName);
      setCategory(cleanCategory);
      setDescription(
        cleanDescription,
      );
      setWebsite(cleanWebsite);

      if (onUpdated) {
        onUpdated();
      }
    } catch (error) {
      console.error(
        "EditPageForm failed:",
        error,
      );

      setError(
        "Failed to update page. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-slate-900 p-6"
    >
      <div>
        <h2 className="text-xl font-bold text-white">
          Edit Page
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Update your page information.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {/* Name */}
        <div>
          <label
            htmlFor="edit-page-name"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Page Name
          </label>

          <input
            id="edit-page-name"
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            maxLength={100}
            disabled={loading}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500 disabled:opacity-60"
          />

          <div className="mt-1 text-right text-xs text-slate-600">
            {name.length}/100
          </div>
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="edit-page-category"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Category
          </label>

          <input
            id="edit-page-category"
            type="text"
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value,
              )
            }
            maxLength={100}
            disabled={loading}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500 disabled:opacity-60"
          />

          <div className="mt-1 text-right text-xs text-slate-600">
            {category.length}/100
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="edit-page-description"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Description
          </label>

          <textarea
            id="edit-page-description"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            maxLength={1000}
            rows={5}
            disabled={loading}
            className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500 disabled:opacity-60"
          />

          <div className="mt-1 text-right text-xs text-slate-600">
            {description.length}/1000
          </div>
        </div>

        {/* Website */}
        <div>
          <label
            htmlFor="edit-page-website"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Website
          </label>

          <input
            id="edit-page-website"
            type="url"
            value={website}
            onChange={(event) =>
              setWebsite(
                event.target.value,
              )
            }
            maxLength={500}
            disabled={loading}
            placeholder="https://example.com"
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500 disabled:opacity-60"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
            {success}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={
              loading ||
              !name.trim() ||
              !category.trim()
            }
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
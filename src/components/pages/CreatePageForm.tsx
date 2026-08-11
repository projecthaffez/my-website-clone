"use client";

import { useState } from "react";
import { createPageAction } from "@/actions/page";

interface CreatePageFormProps {
  onCreated?: (slug: string) => void;
}

export function CreatePageForm({
  onCreated,
}: CreatePageFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] =
    useState("");
  const [website, setWebsite] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");
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

    if (!cleanCategory) {
      setError(
        "Page category is required.",
      );
      return;
    }

    if (cleanName.length > 100) {
      setError(
        "Page name cannot exceed 100 characters.",
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
        await createPageAction(
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
        "Page created successfully.",
      );

      setName("");
      setCategory("");
      setDescription("");
      setWebsite("");

      if (onCreated) {
        onCreated(result.slug);
      }
    } catch (error) {
      console.error(
        "CreatePageForm failed:",
        error,
      );

      setError(
        "Failed to create page. Please try again.",
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
          Create a Page
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Create a public presence for your
          business, brand, organization, or
          community.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {/* Page Name */}
        <div>
          <label
            htmlFor="page-name"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Page Name
          </label>

          <input
            id="page-name"
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            maxLength={100}
            disabled={loading}
            placeholder="e.g. Nexus Technology"
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 disabled:opacity-60"
          />

          <div className="mt-1 text-right text-xs text-slate-600">
            {name.length}/100
          </div>
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="page-category"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Category
          </label>

          <input
            id="page-category"
            type="text"
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value,
              )
            }
            maxLength={100}
            disabled={loading}
            placeholder="e.g. Technology, Business, Community"
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 disabled:opacity-60"
          />

          <div className="mt-1 text-right text-xs text-slate-600">
            {category.length}/100
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="page-description"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Description
          </label>

          <textarea
            id="page-description"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            maxLength={1000}
            rows={4}
            disabled={loading}
            placeholder="Tell people what this page is about..."
            className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 disabled:opacity-60"
          />

          <div className="mt-1 text-right text-xs text-slate-600">
            {description.length}/1000
          </div>
        </div>

        {/* Website */}
        <div>
          <label
            htmlFor="page-website"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Website
            <span className="ml-1 text-slate-600">
              (optional)
            </span>
          </label>

          <input
            id="page-website"
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
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 disabled:opacity-60"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Success */}
        {success && !error && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
            {success}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-1">
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
              ? "Creating..."
              : "Create Page"}
          </button>
        </div>
      </div>
    </form>
  );
}
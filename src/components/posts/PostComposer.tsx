"use client";

import { useRef, useState } from "react";
import { createPostAction } from "@/actions/post";

interface PostComposerProps {
  userName: string;
}

interface SelectedMedia {
  id: string;
  file: File;
  previewUrl: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
  aspectRatio: number | null;
}

interface UploadedMedia {
  url: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
  aspectRatio: number | null;
}

const MAX_FILES = 10;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Map<
  string,
  {
    type: "IMAGE" | "VIDEO" | "DOCUMENT";
    maxSize: number;
  }
>([
  ["image/jpeg", { type: "IMAGE", maxSize: MAX_IMAGE_SIZE }],
  ["image/png", { type: "IMAGE", maxSize: MAX_IMAGE_SIZE }],
  ["image/webp", { type: "IMAGE", maxSize: MAX_IMAGE_SIZE }],
  ["image/gif", { type: "IMAGE", maxSize: MAX_IMAGE_SIZE }],

  ["video/mp4", { type: "VIDEO", maxSize: MAX_VIDEO_SIZE }],
  ["video/webm", { type: "VIDEO", maxSize: MAX_VIDEO_SIZE }],
  ["video/quicktime", { type: "VIDEO", maxSize: MAX_VIDEO_SIZE }],

  [
    "application/pdf",
    {
      type: "DOCUMENT",
      maxSize: MAX_DOCUMENT_SIZE,
    },
  ],
  [
    "application/msword",
    {
      type: "DOCUMENT",
      maxSize: MAX_DOCUMENT_SIZE,
    },
  ],
  [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    {
      type: "DOCUMENT",
      maxSize: MAX_DOCUMENT_SIZE,
    },
  ],
]);

export function PostComposer({
  userName,
}: PostComposerProps) {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [content, setContent] = useState("");
  const [media, setMedia] = useState<
    SelectedMedia[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  function getAspectRatio(
    file: File,
  ): Promise<number | null> {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const image = new Image();

        image.onload = () => {
          if (
            image.naturalWidth > 0 &&
            image.naturalHeight > 0
          ) {
            resolve(
              image.naturalWidth /
                image.naturalHeight,
            );
          } else {
            resolve(null);
          }

          URL.revokeObjectURL(image.src);
        };

        image.onerror = () => {
          URL.revokeObjectURL(image.src);
          resolve(null);
        };

        image.src = URL.createObjectURL(file);
        return;
      }

      if (file.type.startsWith("video/")) {
        const video =
          document.createElement("video");

        video.onloadedmetadata = () => {
          if (
            video.videoWidth > 0 &&
            video.videoHeight > 0
          ) {
            resolve(
              video.videoWidth /
                video.videoHeight,
            );
          } else {
            resolve(null);
          }

          URL.revokeObjectURL(video.src);
        };

        video.onerror = () => {
          URL.revokeObjectURL(video.src);
          resolve(null);
        };

        video.src = URL.createObjectURL(file);
        return;
      }

      resolve(null);
    });
  }

  async function handleFiles(
    files: FileList | null,
  ) {
    if (!files || files.length === 0) {
      return;
    }

    setError("");

    const incomingFiles =
      Array.from(files);

    if (
      media.length +
        incomingFiles.length >
      MAX_FILES
    ) {
      setError(
        `You can attach a maximum of ${MAX_FILES} files.`,
      );
      return;
    }

    const selected: SelectedMedia[] = [];

    for (const file of incomingFiles) {
      const config =
        ALLOWED_TYPES.get(file.type);

      if (!config) {
        setError(
          `Unsupported file type: ${file.name}`,
        );
        continue;
      }

      if (file.size <= 0) {
        setError(
          `The file "${file.name}" is empty.`,
        );
        continue;
      }

      if (file.size > config.maxSize) {
        const maxMB =
          config.maxSize /
          1024 /
          1024;

        setError(
          `"${file.name}" is too large. Maximum size is ${maxMB}MB.`,
        );
        continue;
      }

      const previewUrl =
        URL.createObjectURL(file);

      const aspectRatio =
        await getAspectRatio(file);

      selected.push({
        id: crypto.randomUUID(),
        file,
        previewUrl,
        type: config.type,
        aspectRatio,
      });
    }

    setMedia((current) => [
      ...current,
      ...selected,
    ]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeMedia(id: string) {
    setMedia((current) => {
      const item = current.find(
        (mediaItem) =>
          mediaItem.id === id,
      );

      if (item) {
        URL.revokeObjectURL(
          item.previewUrl,
        );
      }

      return current.filter(
        (mediaItem) =>
          mediaItem.id !== id,
      );
    });
  }

  async function uploadMedia(): Promise<
    UploadedMedia[]
  > {
    const uploaded: UploadedMedia[] =
      [];

    for (const item of media) {
      const formData =
        new FormData();

      formData.append(
        "file",
        item.file,
      );

      const response = await fetch(
        "/api/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ??
            "Failed to upload file.",
        );
      }

      uploaded.push({
        url: result.url,
        type: result.type,
        aspectRatio:
          item.aspectRatio,
      });
    }

    return uploaded;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (
      !content.trim() &&
      media.length === 0
    ) {
      setError(
        "Write something or attach a file before posting.",
      );
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const uploadedMedia =
        await uploadMedia();

      const result =
        await createPostAction(
          content,
          uploadedMedia,
        );

      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }

      media.forEach((item) => {
        URL.revokeObjectURL(
          item.previewUrl,
        );
      });

      setContent("");
      setMedia([]);
      setLoading(false);

      window.location.reload();
    } catch (error) {
      console.error(
        "Post creation failed:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create post. Please try again.",
      );

      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-slate-900 p-5"
    >
      <div className="mb-4">
        <h2 className="font-semibold">
          Create a post
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Share something with your
          network, {userName}.
        </p>
      </div>

      <textarea
        value={content}
        onChange={(event) =>
          setContent(
            event.target.value,
          )
        }
        maxLength={5000}
        rows={5}
        placeholder="What's on your mind?"
        disabled={loading}
        className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 disabled:opacity-60"
      />

      {media.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {media.map((item) => (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-950"
            >
              {item.type ===
                "IMAGE" && (
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="max-h-64 w-full object-cover"
                />
              )}

              {item.type ===
                "VIDEO" && (
                <video
                  src={item.previewUrl}
                  controls
                  className="max-h-64 w-full"
                />
              )}

              {item.type ===
                "DOCUMENT" && (
                <div className="flex min-h-32 items-center justify-center p-5 text-center">
                  <div>
                    <div className="text-3xl">
                      📄
                    </div>

                    <p className="mt-2 break-all text-sm text-slate-300">
                      {item.file.name}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  removeMedia(
                    item.id,
                  )
                }
                disabled={loading}
                className="absolute right-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-black disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {content.length}/5000
          </span>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(event) =>
              handleFiles(
                event.target.files,
              )
            }
            disabled={loading}
            className="hidden"
          />

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={
              loading ||
              media.length >=
                MAX_FILES
            }
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add Media
          </button>

          {media.length > 0 && (
            <span className="text-xs text-slate-500">
              {media.length}/{MAX_FILES} files
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            (!content.trim() &&
              media.length === 0)
          }
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Uploading..."
            : "Post"}
        </button>
      </div>
    </form>
  );
}
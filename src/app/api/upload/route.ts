import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Map<
  string,
  {
    type: "IMAGE" | "VIDEO" | "DOCUMENT";
    maxSize: number;
    extension: string;
  }
>([
  ["image/jpeg", { type: "IMAGE", maxSize: MAX_IMAGE_SIZE, extension: "jpg" }],
  ["image/png", { type: "IMAGE", maxSize: MAX_IMAGE_SIZE, extension: "png" }],
  ["image/webp", { type: "IMAGE", maxSize: MAX_IMAGE_SIZE, extension: "webp" }],
  ["image/gif", { type: "IMAGE", maxSize: MAX_IMAGE_SIZE, extension: "gif" }],

  ["video/mp4", { type: "VIDEO", maxSize: MAX_VIDEO_SIZE, extension: "mp4" }],
  ["video/webm", { type: "VIDEO", maxSize: MAX_VIDEO_SIZE, extension: "webm" }],
  ["video/quicktime", { type: "VIDEO", maxSize: MAX_VIDEO_SIZE, extension: "mov" }],

  [
    "application/pdf",
    {
      type: "DOCUMENT",
      maxSize: MAX_DOCUMENT_SIZE,
      extension: "pdf",
    },
  ],
  [
    "application/msword",
    {
      type: "DOCUMENT",
      maxSize: MAX_DOCUMENT_SIZE,
      extension: "doc",
    },
  ],
  [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    {
      type: "DOCUMENT",
      maxSize: MAX_DOCUMENT_SIZE,
      extension: "docx",
    },
  ],
]);

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in to upload files.",
        },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No file was provided.",
        },
        { status: 400 },
      );
    }

    const fileConfig = ALLOWED_TYPES.get(file.type);

    if (!fileConfig) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unsupported file type. Allowed files are JPG, PNG, WEBP, GIF, MP4, WEBM, MOV, PDF, DOC, and DOCX.",
        },
        { status: 400 },
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "The selected file is empty.",
        },
        { status: 400 },
      );
    }

    if (file.size > fileConfig.maxSize) {
      const maxSizeMB = Math.round(
        fileConfig.maxSize / 1024 / 1024,
      );

      return NextResponse.json(
        {
          success: false,
          error: `File is too large. Maximum size is ${maxSizeMB}MB.`,
        },
        { status: 400 },
      );
    }

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
    );

    await mkdir(uploadDirectory, {
      recursive: true,
    });

    const fileName = `${randomUUID()}.${fileConfig.extension}`;

    const filePath = path.join(
      uploadDirectory,
      fileName,
    );

    const bytes = await file.arrayBuffer();

    await writeFile(
      filePath,
      Buffer.from(bytes),
    );

    return NextResponse.json({
      success: true,
      url: `/uploads/${fileName}`,
      type: fileConfig.type,
      fileName,
      size: file.size,
    });
  } catch (error) {
    console.error(
      "File upload failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to upload file. Please try again.",
      },
      { status: 500 },
    );
  }
}
import type { LocalUploadResult } from "./local-storage";
import { put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

/**
 * Vercel Blob adapter (optional)
 *
 * - When BLOB_READ_WRITE_TOKEN is set, uploads are mirrored to Vercel Blob
 *   and the returned URL is the Blob public URL.
 * - When the token is NOT set, all logic falls back to existing local storage.
 *
 * This is designed to be TEMPORARY and easy to remove:
 * - Delete this file
 * - Remove imports from callers
 * - Remove the BLOB_READ_WRITE_TOKEN env var and @vercel/blob dependency
 */

export const isBlobEnabled = !!process.env.BLOB_READ_WRITE_TOKEN;

/**
 * Promote an already-processed local upload (saved under public/storage/media)
 * to Vercel Blob, and return the same shape with the URL replaced by
 * the Blob public URL.
 *
 * NOTE:
 * - Local processing (sharp, validation, etc.) still runs first.
 * - Local file is only a source for upload; it can be considered ephemeral.
 */
export async function promoteLocalUploadToBlob(
  upload: LocalUploadResult
): Promise<LocalUploadResult> {
  if (!isBlobEnabled) {
    return upload;
  }

  // Local file absolute path, e.g. public/storage/media/...
  const localPath = path.join(process.cwd(), "public", upload.url);

  const buffer = await fs.readFile(localPath);

  // Use a clean key inside the Blob bucket.
  // Example:
  //   /storage/media/uploads/file.webp -> media/uploads/file.webp
  const key = upload.url.replace(/^\/?storage\/media\//, "media/");

  const blob = await put(key, buffer, {
    access: "public",
    contentType: upload.mimeType,
  });

  // IMPORTANT:
  // - We keep the same shape, only overriding the URL to the Blob URL.
  // - Database and callers keep working, now pointing to Blob instead of local.
  return {
    ...upload,
    url: blob.url,
  };
}



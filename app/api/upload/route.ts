export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt-server";
import { hasPermission } from "@/lib/auth/permissions";
import { uploadToLocalStorage, type UploadOptions } from "@/lib/storage/local-storage";
import { isBlobEnabled, promoteLocalUploadToBlob } from "@/lib/storage/blob-adapter";

/**
 * Local Media Upload API Route
 * Handles secure file uploads with validation and compression
 */

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Permission check
    const hasAccess = await hasPermission(user.userId, "media.upload");
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have permission to upload media" },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string | null;
    const tags = formData.get("tags") as string | null;
    const quality = formData.get("quality") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Prepare upload options
    const options: UploadOptions = {
      folder: folder || undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      quality: quality ? parseInt(quality) : 80,
      generateBlur: true,
    };

    // Upload file to EXISTING local storage pipeline (sharp, validation, etc.)
    // This keeps current behaviour for self-hosted/local environments.
    let result = await uploadToLocalStorage(file, file.name, options);

    // DEMO/PRODUCTION (optional):
    // If BLOB_READ_WRITE_TOKEN is set, mirror the processed file to Vercel Blob
    // and replace result.url with the Blob public URL.
    if (isBlobEnabled) {
      try {
        result = await promoteLocalUploadToBlob(result);
      } catch (err) {
        console.error("Failed to mirror upload to Vercel Blob:", err);
        // For demo safety, we still return the local URL if Blob upload fails.
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 400 }
    );
  }
}


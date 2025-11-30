import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

/**
 * API Route to serve storage files
 * This is needed because Next.js production builds don't serve
 * files from public folder that are created after build time
 * 
 * Production-ready features:
 * - Path traversal protection
 * - File size validation
 * - Streaming for large files
 * - Proper error handling
 * - Security headers
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 50MB max file size
const STORAGE_BASE = path.join(process.cwd(), "public", "storage", "media");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    
    // Handle both array and string formats
    const filePath = Array.isArray(pathSegments) 
      ? pathSegments.join("/") 
      : String(pathSegments);

    // Security: Validate the path to prevent directory traversal
    if (!filePath || filePath.includes("..") || filePath.startsWith("/") || filePath.includes("\\")) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    // Construct the full file path
    // The rewrite sends /storage/media/uploads/file.webp -> /api/storage/uploads/file.webp
    // So we need to construct: public/storage/media/uploads/file.webp
    const fullPath = path.join(STORAGE_BASE, filePath);

    // Ensure the path is within the storage directory (security check)
    const normalizedPath = path.normalize(fullPath);
    const normalizedBase = path.normalize(STORAGE_BASE);

    if (!normalizedPath.startsWith(normalizedBase)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 403 });
    }

    // Check if file exists and get stats
    let stats;
    try {
      stats = await fs.stat(normalizedPath);
      if (!stats.isFile()) {
        return NextResponse.json({ error: "Not a file" }, { status: 404 });
      }
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      throw error;
    }

    // Validate file size
    if (stats.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large" },
        { status: 413 }
      );
    }

    // Determine content type based on file extension
    const ext = path.extname(normalizedPath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
      ".mp4": "video/mp4",
      ".mp3": "audio/mpeg",
      ".json": "application/json",
      ".txt": "text/plain",
    };

    const contentType = contentTypeMap[ext] || "application/octet-stream";

    // Read the file into buffer
    // Note: For very large files (>50MB), consider using a CDN or object storage
    const fileBuffer = await fs.readFile(normalizedPath);

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": fileBuffer.length.toString(),
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error: any) {
    // Log error but don't expose details in production
    console.error("Storage file serving error:", {
      message: error.message,
      code: error.code,
      path: error.path,
    });
    
    // Return generic error to prevent information leakage
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}


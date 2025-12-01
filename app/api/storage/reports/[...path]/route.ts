import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt-server";
import { hasPermission } from "@/lib/auth/permissions";
import fs from "fs/promises";
import path from "path";

/**
 * API Route to serve PDF reports
 * Secured with authentication and permission checks
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Auth check
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Permission check
    const hasAccess = await hasPermission(user.userId, "donor.read");
    if (!hasAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { path: pathArray } = await params;
    const filePath = pathArray.join("/");

    // Security: Prevent directory traversal
    if (filePath.includes("..") || path.isAbsolute(filePath)) {
      return new NextResponse("Invalid path", { status: 400 });
    }

    // Construct full file path
    // - Local/self-hosted: <project>/storage/reports/...
    // - Vercel:            /tmp/storage/reports/...
    const isVercel = !!process.env.VERCEL;
    const baseRoot = isVercel ? "/tmp" : process.cwd();
    const fullPath = path.join(baseRoot, "storage/reports", filePath);

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return new NextResponse("File not found", { status: 404 });
    }

    // Read file
    const fileBuffer = await fs.readFile(fullPath);
    const fileName = path.basename(fullPath);

    // Return PDF file with proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving PDF file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}


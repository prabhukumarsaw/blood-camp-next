export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt-server";
import { hasPermission } from "@/lib/auth/permissions";
import { uploadPDFToStorage } from "@/lib/storage/pdf-storage";

/**
 * Blood Report PDF Upload API Route
 * Handles secure PDF uploads with validation
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Permission check
    const hasAccess = await hasPermission(user.userId, "donor.update");
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have permission to upload reports" },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Upload PDF
    const result = await uploadPDFToStorage(file, file.name, {
      folder: folder || "blood-reports",
      compress: false, // Future: Add PDF compression
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("PDF upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload PDF file" },
      { status: 400 }
    );
  }
}


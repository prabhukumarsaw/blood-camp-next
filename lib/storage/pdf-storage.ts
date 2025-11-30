import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

/**
 * PDF Storage Utility
 * Handles PDF file uploads with compression support
 * Integrates with existing media management system
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const STORAGE_DIR = "storage/reports";
const ALLOWED_TYPES = ["application/pdf"] as const;

export interface PDFUploadOptions {
  folder?: string;
  compress?: boolean; // Future: PDF compression
}

export interface PDFUploadResult {
  filename: string;
  originalName: string;
  url: string; // Relative URL
  fileSize: number;
  mimeType: string;
}

/**
 * Sanitize filename to prevent directory traversal and special characters
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.\./g, "")
    .substring(0, 255);
}

/**
 * Generate unique filename
 */
function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, ext);
  const sanitized = sanitizeFilename(baseName);
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString("hex");
  return `${sanitized}_${timestamp}_${random}${ext}`;
}

/**
 * Ensure storage directory exists
 */
async function ensureStorageDir(subdir?: string): Promise<string> {
  const baseDir = path.join(process.cwd(), STORAGE_DIR);
  const targetDir = subdir ? path.join(baseDir, subdir) : baseDir;
  await fs.mkdir(targetDir, { recursive: true });
  return targetDir;
}

/**
 * Validate PDF file signature (magic bytes)
 */
async function validatePDFSignature(buffer: Buffer): Promise<boolean> {
  // PDF files start with %PDF
  const pdfSignature = buffer.slice(0, 4).toString("ascii");
  return pdfSignature === "%PDF";
}

/**
 * Upload PDF file to local storage
 */
export async function uploadPDFToStorage(
  file: File | Buffer,
  originalName: string,
  options: PDFUploadOptions = {}
): Promise<PDFUploadResult> {
  let buffer: Buffer;
  let mimeType: string;

  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
    mimeType = file.type;
  } else {
    buffer = file;
    mimeType = "application/pdf";
  }

  // Validate file size
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(
      `File size (${(buffer.length / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (10MB)`
    );
  }

  // Validate MIME type
  if (!ALLOWED_TYPES.includes(mimeType as any)) {
    throw new Error(`File type "${mimeType}" is not allowed. Only PDF files are allowed.`);
  }

  // Validate PDF signature
  const isValidPDF = await validatePDFSignature(buffer);
  if (!isValidPDF) {
    throw new Error("File does not appear to be a valid PDF file.");
  }

  // Generate unique filename
  const uniqueFilename = generateUniqueFilename(originalName);

  // Ensure storage directory exists
  const folder = options.folder ? sanitizeFilename(options.folder) : "";
  const storageDir = await ensureStorageDir(folder);

  // Write file
  const filePath = path.join(storageDir, uniqueFilename);
  await fs.writeFile(filePath, buffer);

  // Generate relative URL for database storage
  const relativeUrl = folder
    ? `/storage/reports/${folder}/${uniqueFilename}`
    : `/storage/reports/${uniqueFilename}`;

  return {
    filename: uniqueFilename,
    originalName,
    url: relativeUrl,
    fileSize: buffer.length,
    mimeType,
  };
}

/**
 * Delete PDF file from storage
 */
export async function deletePDFFromStorage(fileUrl: string): Promise<void> {
  try {
    // Remove /storage/reports prefix to get relative path
    const relativePath = fileUrl.replace(/^\/storage\/reports\//, "");
    const filePath = path.join(process.cwd(), STORAGE_DIR, relativePath);
    await fs.unlink(filePath);
  } catch (error) {
    // File might not exist, ignore error
    console.error("Error deleting PDF file:", error);
  }
}


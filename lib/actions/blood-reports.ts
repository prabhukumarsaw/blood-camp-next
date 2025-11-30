"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/jwt-server";
import { hasPermission } from "@/lib/auth/permissions";
import { createAuditLog } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Server Actions for Blood Report Management
 * Handles CRUD operations for blood test reports
 */

const uploadReportSchema = z.object({
  donorId: z.string().min(1, "Donor ID is required"),
  fileUrl: z.string().min(1, "File URL is required"),
  fileName: z.string().min(1, "File name is required"),
  originalFileName: z.string().min(1, "Original file name is required"),
  fileSize: z.number().int().positive("File size must be positive"),
  reportDate: z.string().optional(),
  testType: z.string().optional(),
  notes: z.string().optional(),
});

const getReportsSchema = z.object({
  donorId: z.string().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
});

/**
 * Upload a blood report for a donor
 */
export async function uploadBloodReport(data: z.infer<typeof uploadReportSchema>) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const hasAccess = await hasPermission(currentUser.userId, "donor.update");
    if (!hasAccess) {
      return { success: false, error: "You don't have permission to upload reports" };
    }

    const validated = uploadReportSchema.parse(data);

    // Verify donor exists
    const donor = await prisma.donor.findUnique({
      where: { id: validated.donorId },
    });

    if (!donor) {
      return { success: false, error: "Donor not found" };
    }

    // Create report
    const report = await prisma.bloodReport.create({
      data: {
        donorId: validated.donorId,
        fileName: validated.fileName,
        originalFileName: validated.originalFileName,
        fileUrl: validated.fileUrl,
        fileSize: validated.fileSize,
        reportDate: validated.reportDate ? new Date(validated.reportDate) : null,
        testType: validated.testType || null,
        notes: validated.notes || null,
        uploadedBy: currentUser.userId,
      },
      include: {
        donor: {
          select: {
            fullName: true,
            mobileNumber: true,
            email: true,
          },
        },
      },
    });

    await createAuditLog({
      action: "UPLOAD_BLOOD_REPORT",
      resource: "BloodReport",
      resourceId: report.id,
      description: `User ${currentUser.email} uploaded blood report for donor ${donor.fullName}`,
      metadata: {
        donorId: donor.donorId,
        fileName: report.originalFileName,
      },
    });

    revalidatePath("/dashboard/blood-panel");
    revalidatePath("/dashboard/bloodManagement/ReportUpload");

    return { success: true, report };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Upload blood report error:", error);
    return { success: false, error: "Failed to upload blood report" };
  }
}

/**
 * Get blood reports with pagination
 */
export async function getBloodReports(filters: z.infer<typeof getReportsSchema>) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const hasAccess = await hasPermission(currentUser.userId, "donor.read");
    if (!hasAccess) {
      return { success: false, error: "You don't have permission to view reports" };
    }

    const validated = getReportsSchema.parse(filters);
    const skip = (validated.page - 1) * validated.pageSize;

    const where: any = {};
    if (validated.donorId) {
      where.donorId = validated.donorId;
    }
    where.isActive = true;

    const [reports, total] = await Promise.all([
      prisma.bloodReport.findMany({
        where,
        include: {
          donor: {
            select: {
              id: true,
              donorId: true,
              fullName: true,
              mobileNumber: true,
              bloodGroup: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: validated.pageSize,
      }),
      prisma.bloodReport.count({ where }),
    ]);

    return {
      success: true,
      reports,
      total,
      page: validated.page,
      pageSize: validated.pageSize,
      totalPages: Math.ceil(total / validated.pageSize),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Get blood reports error:", error);
    return { success: false, error: "Failed to fetch blood reports" };
  }
}

/**
 * Get reports for a specific donor
 */
export async function getDonorReports(donorId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const hasAccess = await hasPermission(currentUser.userId, "donor.read");
    if (!hasAccess) {
      return { success: false, error: "You don't have permission to view reports" };
    }

    const reports = await prisma.bloodReport.findMany({
      where: {
        donorId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, reports };
  } catch (error) {
    console.error("Get donor reports error:", error);
    return { success: false, error: "Failed to fetch donor reports" };
  }
}

/**
 * Delete a blood report
 */
export async function deleteBloodReport(reportId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const hasAccess = await hasPermission(currentUser.userId, "donor.update");
    if (!hasAccess) {
      return { success: false, error: "You don't have permission to delete reports" };
    }

    const report = await prisma.bloodReport.findUnique({
      where: { id: reportId },
      include: {
        donor: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!report) {
      return { success: false, error: "Report not found" };
    }

    // Soft delete by setting isActive to false
    await prisma.bloodReport.update({
      where: { id: reportId },
      data: { isActive: false },
    });

    await createAuditLog({
      action: "DELETE_BLOOD_REPORT",
      resource: "BloodReport",
      resourceId: reportId,
      description: `User ${currentUser.email} deleted blood report: ${report.originalFileName}`,
    });

    revalidatePath("/dashboard/blood-panel");
    revalidatePath("/dashboard/bloodManagement/ReportUpload");

    return { success: true };
  } catch (error) {
    console.error("Delete blood report error:", error);
    return { success: false, error: "Failed to delete blood report" };
  }
}

/**
 * Mark report as notified
 */
export async function markReportAsNotified(reportId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.bloodReport.update({
      where: { id: reportId },
      data: {
        isNotified: true,
        notifiedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/blood-panel");
    revalidatePath("/dashboard/bloodManagement/ReportUpload");

    return { success: true };
  } catch (error) {
    console.error("Mark report as notified error:", error);
    return { success: false, error: "Failed to mark report as notified" };
  }
}

/**
 * Bulk upload reports (for bulk upload feature)
 */
export async function bulkUploadBloodReports(
  reports: Array<{
    donorId: string;
    fileUrl: string;
    fileName: string;
    originalFileName: string;
    fileSize: number;
    reportDate?: string;
    testType?: string;
    notes?: string;
  }>
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const hasAccess = await hasPermission(currentUser.userId, "donor.update");
    if (!hasAccess) {
      return { success: false, error: "You don't have permission to upload reports" };
    }

    const results = await Promise.allSettled(
      reports.map((report) =>
        prisma.bloodReport.create({
          data: {
            donorId: report.donorId,
            fileName: report.fileName,
            originalFileName: report.originalFileName,
            fileUrl: report.fileUrl,
            fileSize: report.fileSize,
            reportDate: report.reportDate ? new Date(report.reportDate) : null,
            testType: report.testType || null,
            notes: report.notes || null,
            uploadedBy: currentUser.userId,
          },
        })
      )
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    await createAuditLog({
      action: "BULK_UPLOAD_BLOOD_REPORTS",
      resource: "BloodReport",
      resourceId: "",
      description: `User ${currentUser.email} bulk uploaded ${successful} blood reports`,
      metadata: {
        successful,
        failed,
        total: reports.length,
      },
    });

    revalidatePath("/dashboard/blood-panel");
    revalidatePath("/dashboard/bloodManagement/ReportUpload");

    return {
      success: true,
      successful,
      failed,
      total: reports.length,
    };
  } catch (error) {
    console.error("Bulk upload blood reports error:", error);
    return { success: false, error: "Failed to bulk upload blood reports" };
  }
}


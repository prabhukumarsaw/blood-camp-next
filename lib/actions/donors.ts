"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/jwt-server";
import { hasPermission } from "@/lib/auth/permissions";
import { createAuditLog } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BloodGroup, Gender, DonorStatus, NotificationPreference } from "@prisma/client";

/**
 * Server Actions for Donor Management
 * Handles CRUD operations for donors with permission checks
 */

// Validation schemas
const createDonorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().or(z.date()),
  gender: z.nativeEnum(Gender),
  bloodGroup: z.nativeEnum(BloodGroup),
  weight: z.number().int().positive("Weight must be positive"),
  height: z.number().int().positive("Height must be positive"),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  aadharNumber: z.string().optional().or(z.literal("")),
  permanentAddress: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(1, "Pincode is required"),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  takingMedication: z.boolean().default(false),
  medicationDetails: z.string().optional(),
  chronicIllness: z.boolean().default(false),
  illnessDetails: z.string().optional(),
  donatedBefore: z.boolean().default(false),
  lastDonationDate: z.string().or(z.date()).nullable().optional(),
  surgeryInLast6Months: z.boolean().default(false),
  surgeryDetails: z.string().optional(),
  smokeOrAlcohol: z.boolean().default(false),
  eligibleForDonation: z.boolean().default(false),
  medicalNotes: z.string().optional(),
  willingToBeRegularDonor: z.boolean().default(false),
  notificationPreference: z.array(z.nativeEnum(NotificationPreference)).default([]),
  status: z.nativeEnum(DonorStatus).default(DonorStatus.active),
});

const updateDonorSchema = createDonorSchema.extend({
  id: z.string(),
});

const getDonorsSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
  status: z.nativeEnum(DonorStatus).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  mobileNumber: z.string().optional(),
  aadharNumber: z.string().optional(),
});

/**
 * Generate unique donor ID
 */
function generateDonorId(): string {
  const prefix = "DON";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Create a new donor
 */
export async function createDonor(data: z.infer<typeof createDonorSchema>) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const hasAccess = await hasPermission(currentUser.userId, "donor.create");
    if (!hasAccess) {
      return { success: false, error: "You don't have permission to create donors" };
    }

    const validated = createDonorSchema.parse(data);

    // Check if mobile number already exists
    const existingMobile = await prisma.donor.findUnique({
      where: { mobileNumber: validated.mobileNumber },
    });
    if (existingMobile) {
      return { success: false, error: "Mobile number already registered" };
    }

    // Check if email already exists (if provided)
    if (validated.email) {
      const existingEmail = await prisma.donor.findUnique({
        where: { email: validated.email },
      });
      if (existingEmail) {
        return { success: false, error: "Email already registered" };
      }
    }

    // Check if Aadhar number already exists (if provided)
    if (validated.aadharNumber) {
      const existingAadhar = await prisma.donor.findUnique({
        where: { aadharNumber: validated.aadharNumber },
      });
      if (existingAadhar) {
        return { success: false, error: "Aadhar number already registered" };
      }
    }

    // Generate donor ID
    let donorId = generateDonorId();
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const exists = await prisma.donor.findUnique({
        where: { donorId },
      });
      if (!exists) {
        isUnique = true;
      } else {
        donorId = generateDonorId();
        attempts++;
      }
    }

    // Parse date of birth
    const dateOfBirth = typeof validated.dateOfBirth === "string" 
      ? new Date(validated.dateOfBirth) 
      : validated.dateOfBirth;

    // Parse last donation date
    const lastDonationDate = validated.lastDonationDate
      ? (typeof validated.lastDonationDate === "string" 
          ? new Date(validated.lastDonationDate) 
          : validated.lastDonationDate)
      : null;

    // Create donor
    const donor = await prisma.donor.create({
      data: {
        donorId,
        firstName: validated.firstName,
        lastName: validated.lastName,
        fullName: `${validated.firstName} ${validated.lastName}`.trim(),
        dateOfBirth,
        gender: validated.gender,
        bloodGroup: validated.bloodGroup,
        weight: validated.weight,
        height: validated.height,
        mobileNumber: validated.mobileNumber,
        email: validated.email || null,
        aadharNumber: validated.aadharNumber || null,
        permanentAddress: validated.permanentAddress,
        city: validated.city,
        state: validated.state,
        pincode: validated.pincode,
        emergencyContactName: validated.emergencyContactName || null,
        emergencyContactNumber: validated.emergencyContactNumber || null,
        takingMedication: validated.takingMedication,
        medicationDetails: validated.medicationDetails || null,
        chronicIllness: validated.chronicIllness,
        illnessDetails: validated.illnessDetails || null,
        donatedBefore: validated.donatedBefore,
        lastDonationDate,
        surgeryInLast6Months: validated.surgeryInLast6Months,
        surgeryDetails: validated.surgeryDetails || null,
        smokeOrAlcohol: validated.smokeOrAlcohol,
        eligibleForDonation: validated.eligibleForDonation,
        medicalNotes: validated.medicalNotes || null,
        willingToBeRegularDonor: validated.willingToBeRegularDonor,
        notificationPreference: validated.notificationPreference,
        status: validated.status,
        createdBy: currentUser.userId,
      },
    });

    // Create audit log
    await createAuditLog({
      action: "CREATE_DONOR",
      resource: "Donor",
      resourceId: donor.id,
      description: `User ${currentUser.email} created donor ${donor.donorId}`,
      metadata: {
        donorId: donor.donorId,
        bloodGroup: donor.bloodGroup,
      },
    });

    revalidatePath("/dashboard/blood-panel");

    return { success: true, donor };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Create donor error:", error);
    return { success: false, error: "Failed to create donor" };
  }
}

/**
 * Update an existing donor
 */
export async function updateDonor(data: z.infer<typeof updateDonorSchema>) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const hasAccess = await hasPermission(currentUser.userId, "donor.update");
    if (!hasAccess) {
      return { success: false, error: "You don't have permission to update donors" };
    }

    const validated = updateDonorSchema.parse(data);

    // Check if donor exists
    const existingDonor = await prisma.donor.findUnique({
      where: { id: validated.id },
    });
    if (!existingDonor) {
      return { success: false, error: "Donor not found" };
    }

    // Check mobile number uniqueness if changing
    if (validated.mobileNumber !== existingDonor.mobileNumber) {
      const mobileExists = await prisma.donor.findUnique({
        where: { mobileNumber: validated.mobileNumber },
      });
      if (mobileExists) {
        return { success: false, error: "Mobile number already registered" };
      }
    }

    // Check email uniqueness if changing
    if (validated.email && validated.email !== existingDonor.email) {
      const emailExists = await prisma.donor.findUnique({
        where: { email: validated.email },
      });
      if (emailExists) {
        return { success: false, error: "Email already registered" };
      }
    }

    // Check Aadhar uniqueness if changing
    if (validated.aadharNumber && validated.aadharNumber !== existingDonor.aadharNumber) {
      const aadharExists = await prisma.donor.findUnique({
        where: { aadharNumber: validated.aadharNumber },
      });
      if (aadharExists) {
        return { success: false, error: "Aadhar number already registered" };
      }
    }

    // Parse dates
    const dateOfBirth = typeof validated.dateOfBirth === "string" 
      ? new Date(validated.dateOfBirth) 
      : validated.dateOfBirth;

    const lastDonationDate = validated.lastDonationDate
      ? (typeof validated.lastDonationDate === "string" 
          ? new Date(validated.lastDonationDate) 
          : validated.lastDonationDate)
      : null;

    // Update donor
    const donor = await prisma.donor.update({
      where: { id: validated.id },
      data: {
        firstName: validated.firstName,
        lastName: validated.lastName,
        fullName: `${validated.firstName} ${validated.lastName}`.trim(),
        dateOfBirth,
        gender: validated.gender,
        bloodGroup: validated.bloodGroup,
        weight: validated.weight,
        height: validated.height,
        mobileNumber: validated.mobileNumber,
        email: validated.email || null,
        aadharNumber: validated.aadharNumber || null,
        permanentAddress: validated.permanentAddress,
        city: validated.city,
        state: validated.state,
        pincode: validated.pincode,
        emergencyContactName: validated.emergencyContactName || null,
        emergencyContactNumber: validated.emergencyContactNumber || null,
        takingMedication: validated.takingMedication,
        medicationDetails: validated.medicationDetails || null,
        chronicIllness: validated.chronicIllness,
        illnessDetails: validated.illnessDetails || null,
        donatedBefore: validated.donatedBefore,
        lastDonationDate,
        surgeryInLast6Months: validated.surgeryInLast6Months,
        surgeryDetails: validated.surgeryDetails || null,
        smokeOrAlcohol: validated.smokeOrAlcohol,
        eligibleForDonation: validated.eligibleForDonation,
        medicalNotes: validated.medicalNotes || null,
        willingToBeRegularDonor: validated.willingToBeRegularDonor,
        notificationPreference: validated.notificationPreference,
        status: validated.status,
      },
    });

    // Create audit log
    await createAuditLog({
      action: "UPDATE_DONOR",
      resource: "Donor",
      resourceId: donor.id,
      description: `User ${currentUser.email} updated donor ${donor.donorId}`,
      metadata: {
        donorId: donor.donorId,
      },
    });

    revalidatePath("/dashboard/blood-panel");

    return { success: true, donor };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Update donor error:", error);
    return { success: false, error: "Failed to update donor" };
  }
}

/**
 * Delete a donor
 */
export async function deleteDonor(donorId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const hasAccess = await hasPermission(currentUser.userId, "donor.delete");
    if (!hasAccess) {
      return { success: false, error: "You don't have permission to delete donors" };
    }

    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
    });

    if (!donor) {
      return { success: false, error: "Donor not found" };
    }

    await prisma.donor.delete({
      where: { id: donorId },
    });

    // Create audit log
    await createAuditLog({
      action: "DELETE_DONOR",
      resource: "Donor",
      resourceId: donorId,
      description: `User ${currentUser.email} deleted donor ${donor.donorId}`,
      metadata: {
        donorId: donor.donorId,
      },
    });

    revalidatePath("/dashboard/blood-panel");

    return { success: true };
  } catch (error) {
    console.error("Delete donor error:", error);
    return { success: false, error: "Failed to delete donor" };
  }
}

/**
 * Get donors with filters and pagination
 */
export async function getDonors(filters: z.infer<typeof getDonorsSchema>) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const hasAccess = await hasPermission(currentUser.userId, "donor.read");
    if (!hasAccess) {
      return { success: false, error: "You don't have permission to view donors" };
    }

    const validated = getDonorsSchema.parse(filters);
    const skip = (validated.page - 1) * validated.pageSize;

    const where: any = {};

    // Search filter (name, mobile, email, aadhar)
    if (validated.search) {
      where.OR = [
        { fullName: { contains: validated.search, mode: "insensitive" } },
        { firstName: { contains: validated.search, mode: "insensitive" } },
        { lastName: { contains: validated.search, mode: "insensitive" } },
        { mobileNumber: { contains: validated.search, mode: "insensitive" } },
        { email: { contains: validated.search, mode: "insensitive" } },
        { aadharNumber: { contains: validated.search, mode: "insensitive" } },
      ];
    }

    // Blood group filter
    if (validated.bloodGroup) {
      where.bloodGroup = validated.bloodGroup;
    }

    // Status filter
    if (validated.status) {
      where.status = validated.status;
    }

    // Date range filter
    if (validated.startDate || validated.endDate) {
      where.createdAt = {};
      if (validated.startDate) {
        where.createdAt.gte = new Date(validated.startDate);
      }
      if (validated.endDate) {
        where.createdAt.lte = new Date(validated.endDate);
      }
    }

    // Mobile number filter
    if (validated.mobileNumber) {
      where.mobileNumber = { contains: validated.mobileNumber, mode: "insensitive" };
    }

    // Aadhar number filter
    if (validated.aadharNumber) {
      where.aadharNumber = { contains: validated.aadharNumber, mode: "insensitive" };
    }

    const [donors, total] = await Promise.all([
      prisma.donor.findMany({
        where,
        include: {
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
      prisma.donor.count({ where }),
    ]);

    return {
      success: true,
      donors,
      total,
      page: validated.page,
      pageSize: validated.pageSize,
      totalPages: Math.ceil(total / validated.pageSize),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Get donors error:", error);
    return { success: false, error: "Failed to fetch donors" };
  }
}

/**
 * Get donor by ID
 */
export async function getDonorById(donorId: string) {
  try {
    if (!donorId || donorId.trim() === "") {
      return { success: false, error: "Donor ID is required" };
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const hasAccess = await hasPermission(currentUser.userId, "donor.read");
    if (!hasAccess) {
      return { success: false, error: "You don't have permission to view donors" };
    }

    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!donor) {
      return { success: false, error: "Donor not found" };
    }

    return { success: true, donor };
  } catch (error) {
    console.error("Get donor error:", error);
    return { success: false, error: "Failed to fetch donor" };
  }
}

/**
 * Get donor statistics
 */
export async function getDonorStats() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const hasAccess = await hasPermission(currentUser.userId, "donor.read");
    if (!hasAccess) {
      return { success: false, error: "You don't have permission to view donors" };
    }

    const [
      totalDonors,
      activeDonors,
      newThisWeek,
      totalDonations,
      bloodGroupStats,
      statusStats,
    ] = await Promise.all([
      prisma.donor.count(),
      prisma.donor.count({ where: { status: DonorStatus.active } }),
      prisma.donor.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.donor.count({ where: { donatedBefore: true } }),
      prisma.donor.groupBy({
        by: ["bloodGroup"],
        _count: true,
      }),
      prisma.donor.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    return {
      success: true,
      stats: {
        totalDonors,
        activeDonors,
        newThisWeek,
        totalDonations,
        bloodGroupStats: bloodGroupStats.reduce((acc, item) => {
          acc[item.bloodGroup] = item._count;
          return acc;
        }, {} as Record<string, number>),
        statusStats: statusStats.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  } catch (error) {
    console.error("Get donor stats error:", error);
    return { success: false, error: "Failed to fetch donor statistics" };
  }
}


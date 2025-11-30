"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/jwt-server";
import { hasPermission } from "@/lib/auth/permissions";
import { createAuditLog } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NotificationType, NotificationCategory } from "@prisma/client";

/**
 * Server Actions for Notification Template Management
 */

const createTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  type: z.nativeEnum(NotificationType),
  category: z.nativeEnum(NotificationCategory),
  subject: z.string().optional(),
  content: z.string().min(1, "Template content is required"),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

const updateTemplateSchema = createTemplateSchema.extend({
  id: z.string(),
});

/**
 * Create a new notification template
 */
export async function createNotificationTemplate(
  data: z.infer<typeof createTemplateSchema>
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const hasAccess = await hasPermission(currentUser.userId, "donor.update");
    if (!hasAccess) {
      return { success: false, error: "You don't have permission to create templates" };
    }

    const validated = createTemplateSchema.parse(data);

    // Extract variables from content
    const variableRegex = /\{(\w+)\}/g;
    const matches = validated.content.matchAll(variableRegex);
    const extractedVariables = Array.from(matches, (m) => m[1]);
    const uniqueVariables = [...new Set(extractedVariables)];

    const template = await prisma.notificationTemplate.create({
      data: {
        name: validated.name,
        type: validated.type,
        category: validated.category,
        subject: validated.subject || null,
        content: validated.content,
        variables: uniqueVariables,
        isActive: validated.isActive,
        createdBy: currentUser.userId,
      },
    });

    await createAuditLog({
      action: "CREATE_NOTIFICATION_TEMPLATE",
      resource: "NotificationTemplate",
      resourceId: template.id,
      description: `User ${currentUser.email} created notification template: ${template.name}`,
    });

    revalidatePath("/dashboard/bloodManagement/notificationSetup");
    return { success: true, template };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Create template error:", error);
    return { success: false, error: "Failed to create template" };
  }
}

/**
 * Update a notification template
 */
export async function updateNotificationTemplate(
  data: z.infer<typeof updateTemplateSchema>
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const hasAccess = await hasPermission(currentUser.userId, "donor.update");
    if (!hasAccess) {
      return { success: false, error: "You don't have permission to update templates" };
    }

    const validated = updateTemplateSchema.parse(data);

    // Extract variables from content
    const variableRegex = /\{(\w+)\}/g;
    const matches = validated.content.matchAll(variableRegex);
    const extractedVariables = Array.from(matches, (m) => m[1]);
    const uniqueVariables = [...new Set(extractedVariables)];

    const template = await prisma.notificationTemplate.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        type: validated.type,
        category: validated.category,
        subject: validated.subject || null,
        content: validated.content,
        variables: uniqueVariables,
        isActive: validated.isActive,
      },
    });

    await createAuditLog({
      action: "UPDATE_NOTIFICATION_TEMPLATE",
      resource: "NotificationTemplate",
      resourceId: template.id,
      description: `User ${currentUser.email} updated notification template: ${template.name}`,
    });

    revalidatePath("/dashboard/bloodManagement/notificationSetup");
    return { success: true, template };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Update template error:", error);
    return { success: false, error: "Failed to update template" };
  }
}

/**
 * Get all notification templates
 */
export async function getNotificationTemplates(filters?: {
  type?: NotificationType;
  category?: NotificationCategory;
  isActive?: boolean;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const hasAccess = await hasPermission(currentUser.userId, "donor.read");
    if (!hasAccess) {
      return { success: false, error: "You don't have permission to view templates" };
    }

    const where: any = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.category) where.category = filters.category;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    const templates = await prisma.notificationTemplate.findMany({
      where,
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

    return { success: true, templates };
  } catch (error) {
    console.error("Get templates error:", error);
    return { success: false, error: "Failed to fetch templates" };
  }
}

/**
 * Get template by ID
 */
export async function getNotificationTemplateById(templateId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const template = await prisma.notificationTemplate.findUnique({
      where: { id: templateId },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    return { success: true, template };
  } catch (error) {
    console.error("Get template error:", error);
    return { success: false, error: "Failed to fetch template" };
  }
}

/**
 * Delete a notification template
 */
export async function deleteNotificationTemplate(templateId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const hasAccess = await hasPermission(currentUser.userId, "donor.update");
    if (!hasAccess) {
      return { success: false, error: "You don't have permission to delete templates" };
    }

    const template = await prisma.notificationTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    await prisma.notificationTemplate.delete({
      where: { id: templateId },
    });

    await createAuditLog({
      action: "DELETE_NOTIFICATION_TEMPLATE",
      resource: "NotificationTemplate",
      resourceId: templateId,
      description: `User ${currentUser.email} deleted notification template: ${template.name}`,
    });

    revalidatePath("/dashboard/bloodManagement/notificationSetup");
    return { success: true };
  } catch (error) {
    console.error("Delete template error:", error);
    return { success: false, error: "Failed to delete template" };
  }
}

/**
 * Increment template usage count
 */
export async function incrementTemplateUsage(templateId: string) {
  try {
    await prisma.notificationTemplate.update({
      where: { id: templateId },
      data: {
        usageCount: { increment: 1 },
        lastUsed: new Date(),
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Increment usage error:", error);
    return { success: false };
  }
}


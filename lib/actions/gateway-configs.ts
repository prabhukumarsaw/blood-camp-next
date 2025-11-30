"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/jwt-server";
import { hasPermission } from "@/lib/auth/permissions";
import { createAuditLog } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { GatewayType } from "@prisma/client";

/**
 * Server Actions for Gateway Configuration Management
 */

const createGatewaySchema = z.object({
  type: z.nativeEnum(GatewayType),
  name: z.string().min(1, "Gateway name is required"),
  provider: z.string().min(1, "Provider name is required"),
  config: z.string().min(1, "Configuration is required"), // JSON string
  testApiKey: z.string().optional(),
  testApiSecret: z.string().optional(),
  isActive: z.boolean().default(false),
  isDefault: z.boolean().default(false),
});

const updateGatewaySchema = createGatewaySchema.extend({
  id: z.string(),
});

/**
 * Create a new gateway configuration
 */
export async function createGatewayConfig(data: z.infer<typeof createGatewaySchema>) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const hasAccess = await hasPermission(currentUser.userId, "donor.update");
    if (!hasAccess) {
      return { success: false, error: "You don't have permission to create gateway configs" };
    }

    const validated = createGatewaySchema.parse(data);

    // If setting as default, unset other defaults of same type
    if (validated.isDefault) {
      await prisma.gatewayConfig.updateMany({
        where: {
          type: validated.type,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const gateway = await prisma.gatewayConfig.create({
      data: {
        type: validated.type,
        name: validated.name,
        provider: validated.provider,
        config: validated.config,
        testApiKey: validated.testApiKey || null,
        testApiSecret: validated.testApiSecret || null,
        isActive: validated.isActive,
        isDefault: validated.isDefault,
        createdBy: currentUser.userId,
      },
    });

    await createAuditLog({
      action: "CREATE_GATEWAY_CONFIG",
      resource: "GatewayConfig",
      resourceId: gateway.id,
      description: `User ${currentUser.email} created gateway config: ${gateway.name}`,
    });

    revalidatePath("/dashboard/bloodManagement/notificationSetup");
    return { success: true, gateway };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Create gateway error:", error);
    return { success: false, error: "Failed to create gateway configuration" };
  }
}

/**
 * Update gateway configuration
 */
export async function updateGatewayConfig(data: z.infer<typeof updateGatewaySchema>) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const hasAccess = await hasPermission(currentUser.userId, "donor.update");
    if (!hasAccess) {
      return { success: false, error: "You don't have permission to update gateway configs" };
    }

    const validated = updateGatewaySchema.parse(data);

    // If setting as default, unset other defaults of same type
    if (validated.isDefault) {
      await prisma.gatewayConfig.updateMany({
        where: {
          type: validated.type,
          isDefault: true,
          id: { not: validated.id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const gateway = await prisma.gatewayConfig.update({
      where: { id: validated.id },
      data: {
        type: validated.type,
        name: validated.name,
        provider: validated.provider,
        config: validated.config,
        testApiKey: validated.testApiKey || null,
        testApiSecret: validated.testApiSecret || null,
        isActive: validated.isActive,
        isDefault: validated.isDefault,
      },
    });

    await createAuditLog({
      action: "UPDATE_GATEWAY_CONFIG",
      resource: "GatewayConfig",
      resourceId: gateway.id,
      description: `User ${currentUser.email} updated gateway config: ${gateway.name}`,
    });

    revalidatePath("/dashboard/bloodManagement/notificationSetup");
    return { success: true, gateway };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Update gateway error:", error);
    return { success: false, error: "Failed to update gateway configuration" };
  }
}

/**
 * Get all gateway configurations
 */
export async function getGatewayConfigs(filters?: {
  type?: GatewayType;
  isActive?: boolean;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const hasAccess = await hasPermission(currentUser.userId, "donor.read");
    if (!hasAccess) {
      return { success: false, error: "You don't have permission to view gateway configs" };
    }

    const where: any = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    const gateways = await prisma.gatewayConfig.findMany({
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
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });

    return { success: true, gateways };
  } catch (error) {
    console.error("Get gateways error:", error);
    return { success: false, error: "Failed to fetch gateway configurations" };
  }
}

/**
 * Get gateway by ID
 */
export async function getGatewayConfigById(gatewayId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const gateway = await prisma.gatewayConfig.findUnique({
      where: { id: gatewayId },
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

    if (!gateway) {
      return { success: false, error: "Gateway not found" };
    }

    return { success: true, gateway };
  } catch (error) {
    console.error("Get gateway error:", error);
    return { success: false, error: "Failed to fetch gateway configuration" };
  }
}

/**
 * Delete gateway configuration
 */
export async function deleteGatewayConfig(gatewayId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const hasAccess = await hasPermission(currentUser.userId, "donor.update");
    if (!hasAccess) {
      return { success: false, error: "You don't have permission to delete gateway configs" };
    }

    const gateway = await prisma.gatewayConfig.findUnique({
      where: { id: gatewayId },
    });

    if (!gateway) {
      return { success: false, error: "Gateway not found" };
    }

    await prisma.gatewayConfig.delete({
      where: { id: gatewayId },
    });

    await createAuditLog({
      action: "DELETE_GATEWAY_CONFIG",
      resource: "GatewayConfig",
      resourceId: gatewayId,
      description: `User ${currentUser.email} deleted gateway config: ${gateway.name}`,
    });

    revalidatePath("/dashboard/bloodManagement/notificationSetup");
    return { success: true };
  } catch (error) {
    console.error("Delete gateway error:", error);
    return { success: false, error: "Failed to delete gateway configuration" };
  }
}

/**
 * Test gateway connection
 */
export async function testGatewayConnection(gatewayId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const gateway = await prisma.gatewayConfig.findUnique({
      where: { id: gatewayId },
    });

    if (!gateway) {
      return { success: false, error: "Gateway not found" };
    }

    // Dummy test - replace with actual API call when ready
    // Simulate API test
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In real implementation, you would:
    // 1. Parse the config JSON
    // 2. Make API call to test endpoint
    // 3. Return success/failure based on response

    return {
      success: true,
      message: "Connection test successful (dummy)",
      // In real implementation, return actual test results
    };
  } catch (error) {
    console.error("Test gateway error:", error);
    return { success: false, error: "Failed to test gateway connection" };
  }
}


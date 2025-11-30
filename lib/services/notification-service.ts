/**
 * Notification Service
 * Handles sending notifications via different gateways
 * Uses dummy APIs - ready to replace with real API calls
 */

import { NotificationType, NotificationCategory } from "@prisma/client";
import { getGatewayConfigs } from "@/lib/actions/gateway-configs";
import { incrementTemplateUsage } from "@/lib/actions/notification-templates";

interface SendNotificationParams {
  templateId: string;
  recipientId: string;
  recipientMobile?: string;
  recipientEmail?: string;
  variables?: Record<string, string>;
}

interface BulkSendNotificationParams {
  templateId: string;
  recipientIds: string[];
  variables?: Record<string, string>;
}

/**
 * Replace template variables with actual values
 */
function replaceVariables(content: string, variables: Record<string, string> = {}): string {
  let result = content;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    result = result.replace(regex, value);
  });
  return result;
}

/**
 * Send notification via SMS (Dummy API)
 */
async function sendSMS(
  mobileNumber: string,
  message: string,
  gatewayConfig: any
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Dummy implementation - replace with real API call
  console.log("Sending SMS via", gatewayConfig.provider);
  console.log("To:", mobileNumber);
  console.log("Message:", message);
  console.log("Config:", JSON.parse(gatewayConfig.config));

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Dummy response - in real implementation, make actual API call
  // Example: await twilioClient.messages.create({ to: mobileNumber, body: message, from: config.from })
  
  return {
    success: true,
    messageId: `dummy_sms_${Date.now()}`,
  };
}

/**
 * Send notification via Email (Dummy API)
 */
async function sendEmail(
  email: string,
  subject: string,
  content: string,
  gatewayConfig: any
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Dummy implementation - replace with real API call
  console.log("Sending Email via", gatewayConfig.provider);
  console.log("To:", email);
  console.log("Subject:", subject);
  console.log("Content:", content);
  console.log("Config:", JSON.parse(gatewayConfig.config));

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Dummy response - in real implementation, make actual API call
  // Example: await sesClient.sendEmail({ to: email, subject, html: content })
  
  return {
    success: true,
    messageId: `dummy_email_${Date.now()}`,
  };
}

/**
 * Send notification via WhatsApp (Dummy API)
 */
async function sendWhatsApp(
  mobileNumber: string,
  message: string,
  gatewayConfig: any
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Dummy implementation - replace with real API call
  console.log("Sending WhatsApp via", gatewayConfig.provider);
  console.log("To:", mobileNumber);
  console.log("Message:", message);
  console.log("Config:", JSON.parse(gatewayConfig.config));

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Dummy response - in real implementation, make actual API call
  // Example: await whatsappClient.sendMessage({ to: mobileNumber, message })
  
  return {
    success: true,
    messageId: `dummy_whatsapp_${Date.now()}`,
  };
}

/**
 * Send single notification
 */
export async function sendNotification(params: SendNotificationParams) {
  try {
    // Get template
    const { getNotificationTemplateById } = await import("@/lib/actions/notification-templates");
    const templateResult = await getNotificationTemplateById(params.templateId);

    if (!templateResult.success || !templateResult.template) {
      return { success: false, error: "Template not found" };
    }

    const template = templateResult.template;

    // Get active gateway for this type
    const gatewayResult = await getGatewayConfigs({
      type: template.type as any,
      isActive: true,
    });

    if (!gatewayResult.success || !gatewayResult.gateways || gatewayResult.gateways.length === 0) {
      return { success: false, error: `No active gateway configured for ${template.type}` };
    }

    // Use default gateway or first active one
    const gateway = gatewayResult.gateways.find((g) => g.isDefault) || gatewayResult.gateways[0];

    // Replace variables in template
    const content = replaceVariables(template.content, params.variables);
    const subject = template.subject ? replaceVariables(template.subject, params.variables) : undefined;

    // Send based on type
    let result;
    switch (template.type) {
      case "SMS":
        if (!params.recipientMobile) {
          return { success: false, error: "Mobile number is required for SMS" };
        }
        result = await sendSMS(params.recipientMobile, content, gateway);
        break;

      case "EMAIL":
        if (!params.recipientEmail) {
          return { success: false, error: "Email is required for email notification" };
        }
        result = await sendEmail(params.recipientEmail, subject || "Notification", content, gateway);
        break;

      case "WHATSAPP":
        if (!params.recipientMobile) {
          return { success: false, error: "Mobile number is required for WhatsApp" };
        }
        result = await sendWhatsApp(params.recipientMobile, content, gateway);
        break;

      default:
        return { success: false, error: `Unsupported notification type: ${template.type}` };
    }

    // Increment template usage
    await incrementTemplateUsage(params.templateId);

    // Update gateway stats
    // TODO: Update gateway success/failure counts

    return result;
  } catch (error: any) {
    console.error("Send notification error:", error);
    return { success: false, error: error.message || "Failed to send notification" };
  }
}

/**
 * Send bulk notifications
 */
export async function sendBulkNotifications(params: BulkSendNotificationParams) {
  try {
    // Get template
    const { getNotificationTemplateById } = await import("@/lib/actions/notification-templates");
    const templateResult = await getNotificationTemplateById(params.templateId);

    if (!templateResult.success || !templateResult.template) {
      return { success: false, error: "Template not found" };
    }

    const template = templateResult.template;

    // Get active gateway
    const gatewayResult = await getGatewayConfigs({
      type: template.type as any,
      isActive: true,
    });

    if (!gatewayResult.success || !gatewayResult.gateways || gatewayResult.gateways.length === 0) {
      return { success: false, error: `No active gateway configured for ${template.type}` };
    }

    const gateway = gatewayResult.gateways.find((g) => g.isDefault) || gatewayResult.gateways[0];

    // Get donor details
    const { getDonors } = await import("@/lib/actions/donors");
    const donorsResult = await getDonors({
      page: 1,
      pageSize: 10000,
    });

    if (!donorsResult.success || !donorsResult.donors) {
      return { success: false, error: "Failed to fetch donors" };
    }

    const donors = donorsResult.donors.filter((d: any) => params.recipientIds.includes(d.id));

    // Send notifications
    const results = await Promise.allSettled(
      donors.map(async (donor: any) => {
        const variables = {
          name: donor.fullName,
          mobile: donor.mobileNumber,
          email: donor.email || "",
          donorId: donor.donorId,
          ...params.variables,
        };

        const content = replaceVariables(template.content, variables);
        const subject = template.subject ? replaceVariables(template.subject, variables) : undefined;

        switch (template.type) {
          case "SMS":
            return await sendSMS(donor.mobileNumber, content, gateway);
          case "EMAIL":
            return await sendEmail(donor.email || "", subject || "Notification", content, gateway);
          case "WHATSAPP":
            return await sendWhatsApp(donor.mobileNumber, content, gateway);
          default:
            throw new Error(`Unsupported type: ${template.type}`);
        }
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
    const failed = results.length - successful;

    // Increment template usage
    await incrementTemplateUsage(params.templateId);

    return {
      success: true,
      total: results.length,
      successful,
      failed,
    };
  } catch (error: any) {
    console.error("Bulk send error:", error);
    return { success: false, error: error.message || "Failed to send bulk notifications" };
  }
}


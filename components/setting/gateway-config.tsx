// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Save, TestTube, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  createGatewayConfig,
  updateGatewayConfig,
  testGatewayConnection,
  type GatewayConfig as GatewayType,
} from "@/lib/actions/gateway-configs";

const PROVIDER_CONFIGS: Record<string, { fields: string[]; example: string }> = {
  Twilio: {
    fields: ["accountSid", "authToken", "fromNumber"],
    example: JSON.stringify({ accountSid: "AC...", authToken: "...", fromNumber: "+1234567890" }, null, 2),
  },
  "AWS SES": {
    fields: ["accessKeyId", "secretAccessKey", "region", "fromEmail"],
    example: JSON.stringify({ accessKeyId: "...", secretAccessKey: "...", region: "us-east-1", fromEmail: "noreply@example.com" }, null, 2),
  },
  "WhatsApp Business API": {
    fields: ["apiKey", "phoneNumberId", "businessAccountId"],
    example: JSON.stringify({ apiKey: "...", phoneNumberId: "...", businessAccountId: "..." }, null, 2),
  },
  "Custom SMS": {
    fields: ["apiUrl", "apiKey", "senderId"],
    example: JSON.stringify({ apiUrl: "https://api.example.com/sms", apiKey: "...", senderId: "..." }, null, 2),
  },
  "Custom Email": {
    fields: ["smtpHost", "smtpPort", "username", "password", "fromEmail"],
    example: JSON.stringify({ smtpHost: "smtp.example.com", smtpPort: 587, username: "...", password: "...", fromEmail: "noreply@example.com" }, null, 2),
  },
};

interface GatewayConfigProps {
  gateway: GatewayType | null;
  onSave: () => void;
}

export function GatewayConfig({ gateway, onSave }: GatewayConfigProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [formData, setFormData] = useState({
    type: "SMS" as "SMS" | "EMAIL" | "WHATSAPP",
    name: "",
    provider: "",
    config: "",
    testApiKey: "",
    testApiSecret: "",
    isActive: false,
    isDefault: false,
  });

  useEffect(() => {
    if (gateway) {
      setFormData({
        type: gateway.type as any,
        name: gateway.name,
        provider: gateway.provider,
        config: gateway.config,
        testApiKey: gateway.testApiKey || "",
        testApiSecret: gateway.testApiSecret || "",
        isActive: gateway.isActive,
        isDefault: gateway.isDefault,
      });
    } else {
      setFormData({
        type: "SMS",
        name: "",
        provider: "",
        config: "",
        testApiKey: "",
        testApiSecret: "",
        isActive: false,
        isDefault: false,
      });
    }
  }, [gateway]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.provider.trim() || !formData.config.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate JSON config
    try {
      JSON.parse(formData.config);
    } catch {
      toast.error("Configuration must be valid JSON");
      return;
    }

    setIsSaving(true);
    try {
      const result = gateway
        ? await updateGatewayConfig({ ...formData, id: gateway.id })
        : await createGatewayConfig(formData);

      if (result.success) {
        toast.success(gateway ? "Gateway updated successfully" : "Gateway created successfully");
        onSave();
        if (!gateway) {
          setFormData({
            type: "SMS",
            name: "",
            provider: "",
            config: "",
            testApiKey: "",
            testApiSecret: "",
            isActive: false,
            isDefault: false,
          });
        }
      } else {
        toast.error(result.error || "Failed to save gateway");
      }
    } catch (error) {
      toast.error("Failed to save gateway");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!gateway) {
      toast.error("Please save the gateway first before testing");
      return;
    }

    setIsTesting(true);
    try {
      const result = await testGatewayConnection(gateway.id);
      if (result.success) {
        toast.success(result.message || "Connection test successful");
      } else {
        toast.error(result.error || "Connection test failed");
      }
    } catch (error) {
      toast.error("Failed to test connection");
    } finally {
      setIsTesting(false);
    }
  };

  const providerExample = formData.provider ? PROVIDER_CONFIGS[formData.provider]?.example : "";

  if (!gateway && !formData.name) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No gateway selected</p>
          <p className="text-sm">Select a gateway from the list or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50/30 to-card">
      {/* Header */}
      <div className="p-3 border-b bg-card shadow-sm">
        <div className="flex items-center justify-between">
          <div>

            <p className="font-semibold text-sm truncate">
              {gateway ? "Update gateway configuration" : "Configure a new notification gateway"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {gateway && (
              <Button variant="outline" onClick={handleTest} disabled={isTesting}>
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            )}
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-2">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Label htmlFor="type">Gateway Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="name">Gateway Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Twilio SMS Gateway"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Label htmlFor="provider">Provider *</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => setFormData({ ...formData, provider: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.type === "SMS" && (
                      <>
                        <SelectItem value="Twilio">Twilio</SelectItem>
                        <SelectItem value="Custom SMS">Custom SMS</SelectItem>
                      </>
                    )}
                    {formData.type === "EMAIL" && (
                      <>
                        <SelectItem value="AWS SES">AWS SES</SelectItem>
                        <SelectItem value="Custom Email">Custom Email</SelectItem>
                      </>
                    )}
                    {formData.type === "WHATSAPP" && (
                      <>
                        <SelectItem value="WhatsApp Business API">WhatsApp Business API</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Label>Active</Label>
                  <p className="text-sm text-gray-500">Only active gateways can be used</p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Label>Default</Label>
                  <p className="text-sm text-gray-500">Set as default gateway for this type</p>
                </div>
                <Switch
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Provider-specific configuration in JSON format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {providerExample && (
                <Alert>
                  <AlertDescription>
                    <strong>Example for {formData.provider}:</strong>
                    <pre className="mt-2 text-xs bg-card p-2 rounded overflow-auto">
                      {providerExample}
                    </pre>
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-4">
                <Label htmlFor="config">Configuration (JSON) *</Label>
                <Textarea
                  id="config"
                  value={formData.config}
                  onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                  placeholder='{"apiKey": "...", "apiSecret": "..."}'
                  className="min-h-[200px] md:w-[50rem] w-full font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Test Credentials */}
          <Card>
            <CardHeader>
              <CardTitle>Test Credentials (Optional)</CardTitle>
              <CardDescription>
                Test API keys for connection testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Label htmlFor="testApiKey">Test API Key</Label>
                <Input
                  id="testApiKey"
                  type="password"
                  value={formData.testApiKey}
                  onChange={(e) => setFormData({ ...formData, testApiKey: e.target.value })}
                  placeholder="Enter test API key"
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="testApiSecret">Test API Secret</Label>
                <Input
                  id="testApiSecret"
                  type="password"
                  value={formData.testApiSecret}
                  onChange={(e) => setFormData({ ...formData, testApiSecret: e.target.value })}
                  placeholder="Enter test API secret"
                />
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          {gateway && (
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Sent</p>
                    <p className="text-2xl font-bold">{gateway.totalSent}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Success</p>
                    <p className="text-2xl font-bold text-green-600">{gateway.successCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{gateway.failureCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


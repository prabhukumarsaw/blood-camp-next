// @ts-nocheck

"use client";

import { useState, useEffect } from "react";
import { Save, Trash2, Send, Eye, Code, Loader2, X } from "lucide-react";
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
import { toast } from "sonner";
import {
  createNotificationTemplate,
  updateNotificationTemplate,
  type NotificationTemplate,
} from "@/lib/actions/notification-templates";
import { SendNotificationDialog } from "./send-notification-dialog";

const AVAILABLE_VARIABLES = [
  { key: "name", label: "Donor Name", example: "{name}" },
  { key: "mobile", label: "Mobile Number", example: "{mobile}" },
  { key: "email", label: "Email", example: "{email}" },
  { key: "donorId", label: "Donor ID", example: "{donorId}" },
  { key: "link", label: "Report Link", example: "{link}" },
  { key: "reportDate", label: "Report Date", example: "{reportDate}" },
  { key: "nextDonationDate", label: "Next Donation Date", example: "{nextDonationDate}" },
  { key: "lastDonationDate", label: "Last Donation Date", example: "{lastDonationDate}" },
  { key: "bloodGroup", label: "Blood Group", example: "{bloodGroup}" },
  { key: "location", label: "Location", example: "{location}" },
];

interface TemplateEditorProps {
  template: NotificationTemplate | null;
  onSave: () => void;
  onDelete: (id: string) => void;
}

export function TemplateEditor({ template, onSave, onDelete }: TemplateEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "SMS" as "SMS" | "EMAIL" | "WHATSAPP",
    category: "CUSTOM" as string,
    subject: "",
    content: "",
    isActive: true,
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        type: template.type as any,
        category: template.category,
        subject: template.subject || "",
        content: template.content,
        isActive: template.isActive,
      });
    } else {
      setFormData({
        name: "",
        type: "SMS",
        category: "CUSTOM",
        subject: "",
        content: "",
        isActive: true,
      });
    }
  }, [template]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const result = template
        ? await updateNotificationTemplate({ ...formData, id: template.id })
        : await createNotificationTemplate(formData);

      if (result.success) {
        toast.success(template ? "Template updated successfully" : "Template created successfully");
        onSave();
        if (!template) {
          // Reset form for new template
          setFormData({
            name: "",
            type: "SMS",
            category: "CUSTOM",
            subject: "",
            content: "",
            isActive: true,
          });
        }
      } else {
        toast.error(result.error || "Failed to save template");
      }
    } catch (error) {
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (template && confirm("Are you sure you want to delete this template?")) {
      onDelete(template.id);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.content;
      const newText = text.substring(0, start) + `{${variable}}` + text.substring(end);
      setFormData({ ...formData, content: newText });
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 2, start + variable.length + 2);
      }, 0);
    } else {
      setFormData({ ...formData, content: formData.content + `{${variable}}` });
    }
  };

  const previewContent = formData.content.replace(/\{(\w+)\}/g, (match, key) => {
    const varMap: Record<string, string> = {
      name: "John Doe",
      mobile: "+91 98765 43210",
      email: "john.doe@example.com",
      donorId: "DON-ABC123",
      link: "https://example.com/report/123",
      reportDate: "15 Jan 2024",
      nextDonationDate: "15 Feb 2024",
      lastDonationDate: "15 Dec 2023",
      bloodGroup: "O+",
      location: "City Hospital",
    };
    return varMap[key] || match;
  });

  if (!template && !formData.name) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No template selected</p>
          <p className="text-sm">Select a template from the list or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full bg-gradient-to-b from-gray-50/30 to-card">
        {/* Header */}
        <div className="p-3 border-b bg-card shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-sm truncate">
                {template ? "Update notification template" : "Create a new notification template"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {isPreviewMode ? "Edit" : "Preview"}
              </Button>
              {template && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowSendDialog(true)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                  <Button variant="outline" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
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
          {isPreviewMode ? (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>How your notification will look</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.type === "EMAIL" && formData.subject && (
                  <div>
                    <Label>Subject</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded border">
                      {previewContent.replace(/\{(\w+)\}/g, (match, key) => {
                        const varMap: Record<string, string> = {
                          name: "John Doe",
                          mobile: "+91 98765 43210",
                          email: "john.doe@example.com",
                          donorId: "DON-ABC123",
                          link: "https://example.com/report/123",
                          reportDate: "15 Jan 2024",
                          nextDonationDate: "15 Feb 2024",
                          lastDonationDate: "15 Dec 2023",
                          bloodGroup: "O+",
                          location: "City Hospital",
                        };
                        return varMap[key] || match;
                      })}
                    </div>
                  </div>
                )}
                <div>
                  <Label>Content</Label>
                  <div className="mt-1 p-4 bg-gray-50 rounded border whitespace-pre-wrap">
                    {previewContent}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <Label htmlFor="name">Template Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Report Ready Notification"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label htmlFor="type">Type *</Label>
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
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REPORT_READY">Report Ready</SelectItem>
                        <SelectItem value="DONATION_REMINDER">Donation Reminder</SelectItem>
                        <SelectItem value="THANK_YOU">Thank You</SelectItem>
                        <SelectItem value="PRIVATE_MESSAGE">Private Message</SelectItem>
                        <SelectItem value="SPONSOR">Sponsor</SelectItem>
                        <SelectItem value="NEXT_DONATION_DATE">Next Donation Date</SelectItem>
                        <SelectItem value="CUSTOM">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.type === "EMAIL" && (
                    <div className="space-y-4">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Email subject line"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <p className="text-sm text-gray-500">Active templates can be used for sending</p>
                    </div>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Template Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Template Content</CardTitle>
                  <CardDescription>
                    Use variables like {"{name}"}, {"{link}"} to personalize messages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Enter your message template here..."
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label>Available Variables</Label>
                    <p className="text-sm text-gray-500 mb-3">
                      Click on a variable to insert it into your template
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_VARIABLES.map((variable) => (
                        <Button
                          key={variable.key}
                          variant="outline"
                          size="sm"
                          onClick={() => insertVariable(variable.key)}
                          className="justify-start"
                        >
                          <Code className="h-3 w-3 mr-2" />
                          <span className="font-mono text-xs">{variable.example}</span>
                          <span className="ml-2 text-xs text-gray-500">{variable.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {template && showSendDialog && (
        <SendNotificationDialog
          template={template}
          open={showSendDialog}
          onOpenChange={setShowSendDialog}
        />
      )}
    </>
  );
}


// @ts-nocheck

"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Mail, MessageSquare, Phone, Settings, Send, Trash2, Edit, Eye, CheckCircle, XCircle, Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { TemplateEditor } from "./template-editor";
import { GatewayConfig } from "./gateway-config";
import { SendNotificationDialog } from "./send-notification-dialog";
import {
  getNotificationTemplates,
  deleteNotificationTemplate,
  type NotificationTemplate as TemplateType,
} from "@/lib/actions/notification-templates";
import {
  getGatewayConfigs,
  type GatewayConfig as GatewayType,
} from "@/lib/actions/gateway-configs";
import { format } from "date-fns";

type ViewMode = "templates" | "gateways";
type TemplateTypeFilter = "all" | "SMS" | "EMAIL" | "WHATSAPP";

export function NotificationSetup() {
  const [viewMode, setViewMode] = useState<ViewMode>("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<GatewayType | null>(null);
  const [templates, setTemplates] = useState<TemplateType[]>([]);
  const [gateways, setGateways] = useState<GatewayType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [templateTypeFilter, setTemplateTypeFilter] = useState<TemplateTypeFilter>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [templatesResult, gatewaysResult] = await Promise.all([
        getNotificationTemplates(),
        getGatewayConfigs(),
      ]);

      if (templatesResult.success && templatesResult.templates) {
        setTemplates(templatesResult.templates);
      }

      if (gatewaysResult.success && gatewaysResult.gateways) {
        setGateways(gatewaysResult.gateways);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: TemplateType) => {
    setSelectedTemplate(template);
    setSelectedGateway(null);
  };

  const handleGatewaySelect = (gateway: GatewayType) => {
    setSelectedGateway(gateway);
    setSelectedTemplate(null);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setSelectedGateway(null);
  };

  const handleNewGateway = () => {
    setSelectedGateway(null);
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    const result = await deleteNotificationTemplate(templateId);
    if (result.success) {
      toast.success("Template deleted successfully");
      setTemplates(templates.filter((t) => t.id !== templateId));
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
      }
    } else {
      toast.error(result.error || "Failed to delete template");
    }
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = templateTypeFilter === "all" || template.type === templateTypeFilter;
      const matchesCategory = filterCategory === "all" || template.category === filterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [templates, searchQuery, templateTypeFilter, filterCategory]);

  const templatesByType = useMemo(() => {
    return {
      all: templates,
      SMS: templates.filter((t) => t.type === "SMS"),
      EMAIL: templates.filter((t) => t.type === "EMAIL"),
      WHATSAPP: templates.filter((t) => t.type === "WHATSAPP"),
    };
  }, [templates]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SMS":
        return <MessageSquare className="h-4 w-4" />;
      case "EMAIL":
        return <Mail className="h-4 w-4" />;
      case "WHATSAPP":
        return <Phone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SMS":
        return "bg-blue-100 text-blue-700";
      case "EMAIL":
        return "bg-purple-100 text-purple-700";
      case "WHATSAPP":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const TemplateListItem = ({
    template,
    inSheet,
  }: {
    template: TemplateType;
    inSheet?: boolean;
  }) => {
    const content = (
      <div
        onClick={() => handleTemplateSelect(template)}
        className={`p-3 cursor-pointer hover:bg-card/10 transition-all border-l-2 ${selectedTemplate?.id === template.id
          ? "bg-primary/10 border-l-primary shadow-sm"
          : "border-l-transparent"
          }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`p-1.5 rounded-md flex-shrink-0 ${getTypeColor(template.type)}`}>
              {getTypeIcon(template.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm truncate">{template.name}</p>
                {template.isActive ? (
                  <Badge variant="default" className="h-4 px-1.5 text-[10px] bg-green-500">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                    Inactive
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 capitalize">
                {template.category.replace(/_/g, " ").toLowerCase()}
              </p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-600 line-clamp-2 mb-2 pl-8">
          {template.content.substring(0, 80)}...
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400 pl-8">
          <span className="flex items-center gap-1">
            <Send className="h-3 w-3" />
            {template.usageCount}
          </span>
          {template.lastUsed && (
            <span className="text-[10px]">{format(new Date(template.lastUsed), "MMM dd, yyyy")}</span>
          )}
        </div>
      </div>
    );

    if (inSheet) {
      return (
        <SheetClose asChild>
          {content}
        </SheetClose>
      );
    }

    return content;
  };

  const TemplateList = ({ inSheet = false }: { inSheet?: boolean }) => (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-2 border-b bg-card shadow-sm">
        <div className="flex items-center justify-between mb-0">
          <div>
            <h2 className="text-lg font-bold">
              Templates
            </h2>
          </div>
          <Button
            size="sm"
            onClick={viewMode === "templates" ? handleNewTemplate : handleNewGateway}
            className="shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </div>

      {/* Template Type Tabs */}
      {viewMode === "templates" && (
        <div className="border-b bg-card">
          <Tabs value={templateTypeFilter} onValueChange={(v) => setTemplateTypeFilter(v as TemplateTypeFilter)}>
            <TabsList className="w-full h-auto p-1 grid grid-cols-4 bg-transparent">
              <TabsTrigger
                value="all"
                className="text-xs py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                All ({templates.length})
              </TabsTrigger>
              <TabsTrigger
                value="SMS"
                className="text-xs py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                SMS ({templatesByType.SMS.length})
              </TabsTrigger>
              <TabsTrigger
                value="EMAIL"
                className="text-xs py-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
              >
                Email ({templatesByType.EMAIL.length})
              </TabsTrigger>
              <TabsTrigger
                value="WHATSAPP"
                className="text-xs py-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
              >
                WhatsApp ({templatesByType.WHATSAPP.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Category Filter (for templates) */}
      {viewMode === "templates" && (
        <div className="p-3 border-b bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs font-medium">Category</span>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full text-xs border rounded px-2 py-1.5 bg-card"
          >
            <option value="all">All Categories</option>
            <option value="REPORT_READY">Report Ready</option>
            <option value="DONATION_REMINDER">Donation Reminder</option>
            <option value="THANK_YOU">Thank You</option>
            <option value="PRIVATE_MESSAGE">Private Message</option>
            <option value="SPONSOR">Sponsor</option>
            <option value="NEXT_DONATION_DATE">Next Donation</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="divide-y">
            {filteredTemplates.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No templates found</p>
                <p className="text-xs text-gray-400 mt-1">Create a new template to get started</p>
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <TemplateListItem key={template.id} template={template} inSheet={inSheet} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-14vh)] min-h-[60vh] border rounded-lg bg-card shadow-lg">
      {/* Mobile trigger for templates list */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-card lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              Templates
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md p-0">
            <SheetHeader className="px-4 pt-4 pb-2 text-left border-b bg-card">
              <SheetTitle>Templates</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[80vh]">
              <TemplateList inSheet />
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <h2 className="text-base font-semibold">Notification templates</h2>
      </div>

      {/* Left Sidebar - desktop only */}
      <div className="hidden lg:flex lg:w-[30%] border-r flex-col min-w-0">
        <TemplateList />
      </div>

      {/* Right Panel - 70% (full width on small screens) */}
      <div className="w-full lg:flex-1 flex flex-col bg-card min-w-0 overflow-y-auto overflow-x-auto lg:overflow-x-hidden">
        <TemplateEditor
          template={selectedTemplate}
          onSave={loadData}
          onDelete={handleDeleteTemplate}
        />

      </div>
    </div>
  );
}


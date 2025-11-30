"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Mail, MessageSquare, Phone, Settings, Send, Trash2, Edit, Eye, CheckCircle, XCircle, Loader2, Filter, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { GatewayConfig } from "./gateway-config";
import {
  getNotificationTemplates,
  deleteNotificationTemplate,
  type NotificationTemplate as TemplateType,
} from "@/lib/actions/notification-templates";
import {
  getGatewayConfigs,
  type GatewayConfig as GatewayType,
} from "@/lib/actions/gateway-configs";

type ViewMode = "templates" | "gateways";
type TemplateTypeFilter = "all" | "SMS" | "EMAIL" | "WHATSAPP";

export function SettingsSetup() {
  const [viewMode, setViewMode] = useState<ViewMode>("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<GatewayType | null>(null);
  const [templates, setTemplates] = useState<TemplateType[]>([]);
  const [gateways, setGateways] = useState<GatewayType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [templateTypeFilter, setTemplateTypeFilter] = useState<TemplateTypeFilter>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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


  const handleGatewaySelect = (gateway: GatewayType) => {
    setSelectedGateway(gateway);
    setSelectedTemplate(null);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

 



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

  // Mobile sidebar overlay
  const MobileSidebarOverlay = () => (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
        isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setIsMobileMenuOpen(false)}
    />
  );

  // Sidebar component
  const Sidebar = () => (
    <div className={`
      flex flex-col bg-card border-r
      ${isMobile 
        ? `fixed inset-y-0 left-0 w-80 z-50 transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`
        : 'w-1/4 min-w-64'
      }
    `}>
      {/* Header */}
      <div className="p-2 border-b bg-card shadow-sm">
        <div className="flex items-center justify-between mb-0">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <h2 className="text-lg font-bold ">Settings</h2>
          </div>
        
        </div>
        <p className="text-xs text-gray-500">System configuration and API settings</p>
        
    
      </div>


      {/* List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="divide-y">
            {gateways.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No gateways configured</p>
                <p className="text-xs text-gray-400 mt-1">Create a new gateway to get started</p>
              </div>
            ) : (
              gateways.map((gateway) => (
                <div
                  key={gateway.id}
                  onClick={() => handleGatewaySelect(gateway)}
                  className={`p-2 cursor-pointer hover:bg-card/10 transition-all duration-200 border-l-2 group ${
                    selectedGateway?.id === gateway.id
                      ? "bg-primary/10 border-l-primary shadow-sm"
                      : "border-l-transparent hover:border-l-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${getTypeColor(gateway.type)}`}>
                        {getTypeIcon(gateway.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm truncate">{gateway.name}</p>
                          {/* {gateway.isDefault && (
                            <Badge variant="secondary" className="h-4 px-1.5 text-[10px] bg-blue-100 text-blue-700">
                              Default
                            </Badge>
                          )} */}
                        </div>
                        {/* <p className="text-xs text-gray-500 truncate">{gateway.provider}</p> */}
                      </div>
                    </div>
                 
                  </div>
                
                </div>
              ))
            )}
          </div>
        )}
      </ScrollArea>

      {/* Mobile Footer Action */}
      {isMobile && (
        <div className="p-4 border-t bg-card">
          <Button className="w-full" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            New Gateway
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-13vh)] border rounded-lg bg-card overflow-hidden shadow-lg relative">
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-30 h-10 w-10 bg-card shadow-md md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Mobile Overlay */}
      <MobileSidebarOverlay />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-card min-w-0">
        {/* Mobile Header */}
        {isMobile && selectedGateway && (
          <div className="p-2 border-b bg-card md:hidden">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getTypeColor(selectedGateway.type)}`}>
                {getTypeIcon(selectedGateway.type)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedGateway.name}</h3>
                <p className="text-sm text-gray-500">{selectedGateway.provider}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {selectedGateway ? (
            <GatewayConfig
              gateway={selectedGateway}
              onSave={loadData}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Gateway Selected</h3>
                <p className="text-sm max-w-sm">
                  {isMobile 
                    ? "Tap on a gateway from the menu to view details" 
                    : "Select a gateway from the sidebar to view and edit its configuration"
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Design Indicators (for debugging) */}
      <style jsx global>{`
        @media (max-width: 767px) {
          .hide-on-mobile {
            display: none !important;
          }
        }
        @media (min-width: 768px) {
          .hide-on-desktop {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Send, Loader2, Users, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { sendNotification, sendBulkNotifications } from "@/lib/services/notification-service";
import { getDonors } from "@/lib/actions/donors";
import type { NotificationTemplate } from "@/lib/actions/notification-templates";

interface SendNotificationDialogProps {
  template: NotificationTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendNotificationDialog({
  template,
  open,
  onOpenChange,
}: SendNotificationDialogProps) {
  const [sendMode, setSendMode] = useState<"single" | "bulk">("single");
  const [isSending, setIsSending] = useState(false);
  const [donorSearch, setDonorSearch] = useState("");
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [customVariables, setCustomVariables] = useState<Record<string, string>>({});

  const handleSearchDonor = async () => {
    if (!donorSearch || donorSearch.length < 10) {
      toast.error("Please enter a valid mobile number or donor ID");
      return;
    }

    setIsSearching(true);
    try {
      const result = await getDonors({
        page: 1,
        pageSize: 10,
        search: donorSearch,
      });

      if (result.success && result.donors && result.donors.length > 0) {
        setSearchResults(result.donors);
        if (result.donors.length === 1) {
          setSelectedDonor(result.donors[0]);
        }
      } else {
        setSearchResults([]);
        setSelectedDonor(null);
        toast.error("No donor found");
      }
    } catch (error) {
      toast.error("Failed to search donor");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSend = async () => {
    if (sendMode === "single") {
      if (!selectedDonor) {
        toast.error("Please select a donor");
        return;
      }
    }

    setIsSending(true);
    try {
      if (sendMode === "single") {
        const result = await sendNotification({
          templateId: template.id,
          recipientId: selectedDonor.id,
          recipientMobile: selectedDonor.mobileNumber,
          recipientEmail: selectedDonor.email,
          variables: {
            name: selectedDonor.fullName,
            mobile: selectedDonor.mobileNumber,
            email: selectedDonor.email || "",
            donorId: selectedDonor.donorId,
            ...customVariables,
          },
        });

        if (result.success) {
          toast.success("Notification sent successfully!");
          onOpenChange(false);
          setSelectedDonor(null);
          setDonorSearch("");
          setCustomVariables({});
        } else {
          toast.error(result.error || "Failed to send notification");
        }
      } else {
        // Bulk send - get all active donors
        const donorsResult = await getDonors({
          page: 1,
          pageSize: 10000,
        });

        if (!donorsResult.success || !donorsResult.donors) {
          toast.error("Failed to fetch donors");
          return;
        }

        const recipientIds = donorsResult.donors.map((d: any) => d.id);
        const result = await sendBulkNotifications({
          templateId: template.id,
          recipientIds,
          variables: customVariables,
        });

        if (result.success) {
          toast.success(
            `Notifications sent! ${result.successful} successful, ${result.failed} failed`
          );
          onOpenChange(false);
          setCustomVariables({});
        } else {
          toast.error(result.error || "Failed to send notifications");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send notification");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Notification
          </DialogTitle>
          <DialogDescription>
            Send notification using template: <strong>{template.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Send Mode */}
          <div>
            <Label className="mb-3 block">Send Mode</Label>
            <RadioGroup value={sendMode} onValueChange={(v: any) => setSendMode(v)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Single Donor</p>
                      <p className="text-xs text-gray-500">Send to one specific donor</p>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="bulk" id="bulk" />
                <Label htmlFor="bulk" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Bulk Send</p>
                      <p className="text-xs text-gray-500">Send to all active donors</p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Single Donor Selection */}
          {sendMode === "single" && (
            <div className="space-y-2">
              <Label>Search Donor</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter mobile number or donor ID"
                  value={donorSearch}
                  onChange={(e) => setDonorSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchDonor();
                    }
                  }}
                />
                <Button onClick={handleSearchDonor} disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                  {searchResults.map((donor) => (
                    <div
                      key={donor.id}
                      onClick={() => setSelectedDonor(donor)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 ${
                        selectedDonor?.id === donor.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <p className="font-medium">{donor.fullName}</p>
                      <p className="text-sm text-gray-500">{donor.mobileNumber}</p>
                      <p className="text-xs text-gray-400">ID: {donor.donorId}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedDonor && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium text-green-900">Selected: {selectedDonor.fullName}</p>
                  <p className="text-sm text-green-700">{selectedDonor.mobileNumber}</p>
                </div>
              )}
            </div>
          )}

          {/* Custom Variables */}
          <div className="space-y-2">
            <Label>Custom Variables (Optional)</Label>
            <p className="text-xs text-gray-500 mb-2">
              Override default variables or add custom ones
            </p>
            <div className="space-y-2">
              {template.variables.map((variable) => (
                <div key={variable} className="flex gap-2">
                  <Input
                    value={customVariables[variable] || ""}
                    onChange={(e) =>
                      setCustomVariables({ ...customVariables, [variable]: e.target.value })
                    }
                    placeholder={`{${variable}}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Template Preview */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <Label className="mb-2 block">Preview</Label>
            <div className="text-sm whitespace-pre-wrap">
              {template.content.replace(/\{(\w+)\}/g, (match, key) => {
                if (sendMode === "single" && selectedDonor) {
                  const varMap: Record<string, string> = {
                    name: selectedDonor.fullName,
                    mobile: selectedDonor.mobileNumber,
                    email: selectedDonor.email || "",
                    donorId: selectedDonor.donorId,
                    ...customVariables,
                  };
                  return varMap[key] || match;
                }
                return customVariables[key] || match;
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending || (sendMode === "single" && !selectedDonor)}>
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


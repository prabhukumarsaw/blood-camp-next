"use client";

import { useState } from "react";
import { FileText, Download, X, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface BloodReport {
  id: string;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  fileSize: number;
  reportDate: Date | null;
  testType: string | null;
  notes: string | null;
  createdAt: Date;
  isNotified: boolean;
}

interface ReportPreviewProps {
  report: BloodReport;
  donorName?: string;
}

export function ReportPreview({ report, donorName }: ReportPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);

  const handleDownload = () => {
    // Create download link
    const link = document.createElement("a");
    link.href = `/api/storage/reports${report.fileUrl.replace("/storage/reports", "")}`;
    link.download = report.originalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fileSizeMB = (report.fileSize / 1024 / 1024).toFixed(2);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        title="Preview Report"
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  {report.originalFileName}
                </DialogTitle>
                <DialogDescription className="mt-2">
                  {donorName && <span className="font-medium">Donor: {donorName}</span>}
                  {report.testType && (
                    <>
                      {" • "}
                      <span>Test Type: {report.testType}</span>
                    </>
                  )}
                  {report.reportDate && (
                    <>
                      {" • "}
                      <span>Report Date: {format(new Date(report.reportDate), "MMM dd, yyyy")}</span>
                    </>
                  )}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                {report.isNotified && (
                  <Badge variant="default" className="bg-green-500">
                    Notified
                  </Badge>
                )}
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto border rounded-lg bg-gray-50">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            )}
            {pdfError && (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Unable to preview PDF</p>
                <p className="text-sm text-gray-500 mb-4">
                  File size: {fileSizeMB} MB
                </p>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download to View
                </Button>
              </div>
            )}
            <iframe
              src={`/api/storage/reports${report.fileUrl.replace("/storage/reports", "")}`}
              className={`w-full h-full min-h-[600px] ${isLoading || pdfError ? "hidden" : ""}`}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setPdfError(true);
                setIsLoading(false);
              }}
              title={report.originalFileName}
            />
          </div>

          {report.notes && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Notes:</strong> {report.notes}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <span>Uploaded: {format(new Date(report.createdAt), "MMM dd, yyyy 'at' h:mm a")}</span>
            <span>Size: {fileSizeMB} MB</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


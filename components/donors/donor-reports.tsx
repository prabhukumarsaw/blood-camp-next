"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Trash2, Eye, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { getDonorReports, deleteBloodReport } from "@/lib/actions/blood-reports";
import { toast } from "sonner";
import { ReportPreview } from "./report-preview";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface DonorReportsProps {
  donorId: string;
  donorName?: string;
}

export function DonorReports({ donorId, donorName }: DonorReportsProps) {
  const [reports, setReports] = useState<BloodReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadReports();
  }, [donorId]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const result = await getDonorReports(donorId);
      if (result.success && result.reports) {
        setReports(result.reports);
      } else {
        toast.error(result.error || "Failed to load reports");
      }
    } catch (error) {
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteReportId) return;

    setIsDeleting(true);
    try {
      const result = await deleteBloodReport(deleteReportId);
      if (result.success) {
        toast.success("Report deleted successfully");
        setReports(reports.filter((r) => r.id !== deleteReportId));
        setDeleteReportId(null);
      } else {
        toast.error(result.error || "Failed to delete report");
      }
    } catch (error) {
      toast.error("Failed to delete report");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = (report: BloodReport) => {
    const link = document.createElement("a");
    link.href = `/api/storage/reports${report.fileUrl.replace("/storage/reports", "")}`;
    link.download = report.originalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-600" />
            Blood Test Reports
          </CardTitle>
          <CardDescription>
            {reports.length === 0
              ? "No reports uploaded yet"
              : `${reports.length} report${reports.length !== 1 ? "s" : ""} available`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No blood test reports available for this donor.</p>
              <p className="text-sm mt-2">Upload reports from the Report Upload page.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 truncate">{report.originalFileName}</p>
                        {report.isNotified && (
                          <Badge variant="default" className="bg-green-500 text-xs">
                            Notified
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        {report.testType && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {report.testType}
                          </span>
                        )}
                        {report.reportDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(report.reportDate), "MMM dd, yyyy")}
                          </span>
                        )}
                        <span>{(report.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        <span>•</span>
                        <span>Uploaded {format(new Date(report.createdAt), "MMM dd, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <ReportPreview report={report} donorName={donorName} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(report)}
                      title="Download Report"
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteReportId(report.id)}
                      title="Delete Report"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button> */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteReportId} onOpenChange={() => setDeleteReportId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


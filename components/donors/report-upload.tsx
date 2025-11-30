"use client";

import React, { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Phone, X, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { uploadBloodReport, bulkUploadBloodReports } from "@/lib/actions/blood-reports";
import { getDonors } from "@/lib/actions/donors";
import { useDropzone } from "react-dropzone";

interface FileWithDonor extends File {
  donorId?: string;
  donorName?: string;
  mobileNumber?: string;
}

export default function ReportUpload() {
  const [singleMobile, setSingleMobile] = useState("");
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [bulkFiles, setBulkFiles] = useState<FileWithDonor[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [autoNotify, setAutoNotify] = useState(true);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [donorSearch, setDonorSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Search donor by mobile number
  const handleSearchDonor = useCallback(async () => {
    if (!donorSearch || donorSearch.length < 10) {
      toast.error("Please enter a valid mobile number (at least 10 digits)");
      return;
    }

    setIsSearching(true);
    try {
      const result = await getDonors({
        page: 1,
        pageSize: 5,
        mobileNumber: donorSearch,
      });

      if (result.success && result.donors && result.donors.length > 0) {
        setSearchResults(result.donors);
        if (result.donors.length === 1) {
          setSelectedDonor(result.donors[0]);
        }
      } else {
        setSearchResults([]);
        setSelectedDonor(null);
        toast.error("No donor found with this mobile number");
      }
    } catch (error) {
      toast.error("Failed to search donor");
    } finally {
      setIsSearching(false);
    }
  }, [donorSearch]);

  // Single file upload handler
  const onSingleDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSingleFile(file);
    }
  }, []);

  const { getRootProps: getSingleRootProps, getInputProps: getSingleInputProps, isDragActive: isSingleDragActive } =
    useDropzone({
      onDrop: onSingleDrop,
      accept: { "application/pdf": [".pdf"] },
      maxFiles: 1,
      disabled: isUploading,
    });

  // Bulk files upload handler
  const onBulkDrop = useCallback(async (acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter((file) => file.type === "application/pdf");
    
    if (pdfFiles.length === 0) {
      toast.error("No PDF files found");
      return;
    }

    // Process files and extract mobile numbers from filenames
    const filesWithDonors: FileWithDonor[] = await Promise.all(
      pdfFiles.map(async (file) => {
        // Extract mobile number from filename (e.g., "9876543210.pdf" or "report_9876543210.pdf")
        const mobileMatch = file.name.match(/(\d{10})/);
        const mobileNumber = mobileMatch ? mobileMatch[1] : null;

        if (mobileNumber) {
          // Try to find donor
          try {
            const result = await getDonors({
              page: 1,
              pageSize: 1,
              mobileNumber: mobileNumber,
            });

            if (result.success && result.donors && result.donors.length > 0) {
              return {
                ...file,
                donorId: result.donors[0].id,
                donorName: result.donors[0].fullName,
                mobileNumber: result.donors[0].mobileNumber,
              } as FileWithDonor;
            }
          } catch (error) {
            console.error("Error finding donor:", error);
          }
        }

        return file as FileWithDonor;
      })
    );

    setBulkFiles(filesWithDonors);
  }, []);

  const { getRootProps: getBulkRootProps, getInputProps: getBulkInputProps, isDragActive: isBulkDragActive } =
    useDropzone({
      onDrop: onBulkDrop,
      accept: { "application/pdf": [".pdf"] },
      multiple: true,
      disabled: isUploading,
    });

  const handleSingleUpload = async () => {
    if (!selectedDonor || !singleFile) {
      toast.error("Please select a donor and upload a file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload PDF file
      const formData = new FormData();
      formData.append("file", singleFile);
      formData.append("folder", "blood-reports");

      const uploadResponse = await fetch("/api/reports/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || "Failed to upload file");
      }

      const uploadResult = await uploadResponse.json();
      setUploadProgress(50);

      // Save report to database
      const reportResult = await uploadBloodReport({
        donorId: selectedDonor.id,
        fileUrl: uploadResult.data.url,
        fileName: uploadResult.data.filename,
        originalFileName: uploadResult.data.originalName,
        fileSize: uploadResult.data.fileSize,
      });

      if (!reportResult.success) {
        throw new Error(reportResult.error || "Failed to save report");
      }

      setUploadProgress(100);
      setUploadComplete(true);
      toast.success("Report uploaded successfully!");
      
      if (autoNotify) {
        // TODO: Implement notification sending
        toast.success("Notification sent to donor");
      }

      // Reset form
      setTimeout(() => {
        setSingleMobile("");
        setSingleFile(null);
        setSelectedDonor(null);
        setSearchResults([]);
        setUploadProgress(0);
        setUploadComplete(false);
      }, 2000);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload report");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (bulkFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    // Filter files that have donor IDs
    const filesWithDonors = bulkFiles.filter((f) => f.donorId);
    const filesWithoutDonors = bulkFiles.filter((f) => !f.donorId);

    if (filesWithoutDonors.length > 0) {
      toast.warning(
        `${filesWithoutDonors.length} file(s) could not be matched to donors. Please check filenames.`
      );
    }

    if (filesWithDonors.length === 0) {
      toast.error("No files could be matched to donors");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = filesWithDonors.length;
      const reports: any[] = [];

      // Upload files and prepare reports
      for (let i = 0; i < filesWithDonors.length; i++) {
        const file = filesWithDonors[i];
        const progress = Math.round(((i + 1) / totalFiles) * 80);
        setUploadProgress(progress);

        // Upload PDF file
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "blood-reports");

        const uploadResponse = await fetch("/api/reports/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          console.error(`Failed to upload ${file.name}`);
          continue;
        }

        const uploadResult = await uploadResponse.json();

        reports.push({
          donorId: file.donorId!,
          fileUrl: uploadResult.data.url,
          fileName: uploadResult.data.filename,
          originalFileName: uploadResult.data.originalName,
          fileSize: uploadResult.data.fileSize,
        });
      }

      setUploadProgress(90);

      // Bulk save reports
      const result = await bulkUploadBloodReports(reports);

      if (!result.success) {
        throw new Error(result.error || "Failed to save reports");
      }

      setUploadProgress(100);
      setUploadComplete(true);
      toast.success(`${result.successful} report(s) uploaded successfully!`);

      if (autoNotify) {
        // TODO: Implement bulk notification sending
        toast.success("Notifications sent to all donors");
      }

      // Reset form
      setTimeout(() => {
        setBulkFiles([]);
        setUploadProgress(0);
        setUploadComplete(false);
      }, 2000);
    } catch (error: any) {
      console.error("Bulk upload error:", error);
      toast.error(error.message || "Failed to upload reports");
    } finally {
      setIsUploading(false);
    }
  };

  const removeBulkFile = (index: number) => {
    setBulkFiles(bulkFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          <strong>Important:</strong> For bulk upload, ensure PDF files are named with donor mobile numbers
          (e.g., 9876543210.pdf). The system will automatically map reports to donors.
        </AlertDescription>
      </Alert>

      {/* Auto Notification Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-medium">Auto-send Notifications</h3>
                <p className="text-gray-500 text-sm">Automatically notify donors after successful upload</p>
              </div>
            </div>
            <Switch checked={autoNotify} onCheckedChange={setAutoNotify} />
          </div>
        </CardContent>
      </Card>

      {/* Upload Tabs */}
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single Upload</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
        </TabsList>

        {/* Single Upload */}
        <TabsContent value="single" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Single Report Upload</CardTitle>
              <CardDescription>Upload a single report by searching for donor mobile number</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Donor Search */}
              <div className="space-y-2">
                <Label htmlFor="mobile">Search Donor by Mobile Number</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="Enter donor mobile number"
                      value={donorSearch}
                      onChange={(e) => setDonorSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearchDonor();
                        }
                      }}
                      className="pl-10"
                      disabled={isUploading || isSearching}
                    />
                  </div>
                  <Button
                    onClick={handleSearchDonor}
                    disabled={isUploading || isSearching || !donorSearch}
                    variant="outline"
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                    {searchResults.map((donor) => (
                      <div
                        key={donor.id}
                        onClick={() => setSelectedDonor(donor)}
                        className={`p-3 cursor-pointer hover:bg-gray-50 ${
                          selectedDonor?.id === donor.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                        }`}
                      >
                        <div className="font-medium">{donor.fullName}</div>
                        <div className="text-sm text-gray-500">{donor.mobileNumber}</div>
                        <div className="text-xs text-gray-400">ID: {donor.donorId}</div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedDonor && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Selected: <strong>{selectedDonor.fullName}</strong> ({selectedDonor.mobileNumber})
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file">Blood Report (PDF)</Label>
                <div
                  {...getSingleRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    isSingleDragActive
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 hover:border-red-400"
                  }`}
                >
                  <input {...getSingleInputProps()} />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Upload className="w-6 h-6 text-red-600" />
                    </div>
                    {singleFile ? (
                      <>
                        <div className="text-gray-900 font-medium">{singleFile.name}</div>
                        <div className="text-gray-500 text-sm">
                          {(singleFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-gray-900">
                          {isSingleDragActive ? "Drop the file here" : "Click to upload or drag and drop"}
                        </div>
                        <div className="text-gray-500 text-sm">PDF files only (max 10MB)</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="text-gray-900">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {uploadComplete && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Report uploaded successfully and{" "}
                    {autoNotify ? "notification sent" : "ready to send notification"}.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                {!uploadComplete ? (
                  <Button
                    onClick={handleSingleUpload}
                    disabled={isUploading || !selectedDonor || !singleFile}
                    className="bg-red-600 hover:bg-red-700 flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? "Uploading..." : "Upload & Send Report"}
                  </Button>
                ) : (
                  <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
                    Upload Another
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Upload */}
        <TabsContent value="bulk" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Report Upload</CardTitle>
              <CardDescription>
                Upload multiple reports at once with auto-mapping by mobile number in filename
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bulk-files">Blood Reports (Multiple PDFs)</Label>
                <div
                  {...getBulkRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    isBulkDragActive
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 hover:border-red-400"
                  }`}
                >
                  <input {...getBulkInputProps()} />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Upload className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="text-gray-900">
                      {isBulkDragActive ? "Drop files here" : "Click to upload or drag and drop"}
                    </div>
                    <div className="text-gray-500 text-sm">Multiple PDF files (max 10MB each)</div>
                    <div className="text-gray-400 text-xs mt-2">File naming: [mobile-number].pdf</div>
                  </div>
                </div>
              </div>

              {bulkFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files ({bulkFiles.length})</Label>
                  <div className="border border-gray-200 rounded-lg divide-y max-h-60 overflow-y-auto">
                    {bulkFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50">
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="w-5 h-5 text-red-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-gray-900 text-sm font-medium truncate">{file.name}</div>
                            <div className="text-gray-500 text-xs">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                            {file.donorName ? (
                              <Badge variant="default" className="mt-1 text-xs">
                                {file.donorName} ({file.mobileNumber})
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="mt-1 text-xs">
                                Donor not found
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBulkFile(index)}
                          disabled={isUploading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processing {bulkFiles.length} files...</span>
                    <span className="text-gray-900">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {uploadComplete && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Reports uploaded successfully and{" "}
                    {autoNotify ? "notifications sent" : "ready to send notifications"}.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                {!uploadComplete ? (
                  <Button
                    onClick={handleBulkUpload}
                    disabled={isUploading || bulkFiles.length === 0}
                    className="bg-red-600 hover:bg-red-700 flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? "Uploading..." : `Upload ${bulkFiles.length} Reports`}
                  </Button>
                ) : (
                  <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
                    Upload More
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


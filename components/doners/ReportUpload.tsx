"use client"
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Phone, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function ReportUpload() {
  const [singleMobile, setSingleMobile] = useState('');
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [autoNotify, setAutoNotify] = useState(true);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleSingleUpload = () => {
    if (!singleMobile || !singleFile) {
      toast.error('Please provide mobile number and select a file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadComplete(true);
          toast.success('Report uploaded successfully!');
          if (autoNotify) {
            toast.success('Notification sent to donor');
          }
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleBulkUpload = () => {
    if (bulkFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadComplete(true);
          toast.success(`${bulkFiles.length} reports uploaded successfully!`);
          if (autoNotify) {
            toast.success('Notifications sent to all donors');
          }
          return 100;
        }
        return prev + 5;
      });
    }, 300);
  };

  const handleSingleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSingleFile(e.target.files[0]);
    }
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBulkFiles(Array.from(e.target.files));
    }
  };

  const removeBulkFile = (index: number) => {
    setBulkFiles(bulkFiles.filter((_, i) => i !== index));
  };

  const resetSingleUpload = () => {
    setSingleMobile('');
    setSingleFile(null);
    setUploadProgress(0);
    setUploadComplete(false);
  };

  const resetBulkUpload = () => {
    setBulkFiles([]);
    setUploadProgress(0);
    setUploadComplete(false);
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
                <h3 className="text-gray-900">Auto-send Notifications</h3>
                <p className="text-gray-500 text-sm">Automatically notify donors after successful upload</p>
              </div>
            </div>
            <Switch
              checked={autoNotify}
              onCheckedChange={setAutoNotify}
            />
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
              <CardDescription>Upload a single report by entering donor mobile number</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="mobile">Donor Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter donor mobile number"
                    value={singleMobile}
                    onChange={(e) => setSingleMobile(e.target.value)}
                    className="pl-10"
                    disabled={isUploading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Blood Report (PDF)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-400 transition-colors">
                  <input
                    id="file"
                    type="file"
                    accept=".pdf"
                    onChange={handleSingleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <Upload className="w-6 h-6 text-red-600" />
                      </div>
                      {singleFile ? (
                        <>
                          <div className="text-gray-900">{singleFile.name}</div>
                          <div className="text-gray-500 text-sm">
                            {(singleFile.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-gray-900">Click to upload or drag and drop</div>
                          <div className="text-gray-500 text-sm">PDF files only (max 10MB)</div>
                        </>
                      )}
                    </div>
                  </label>
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
                    Report uploaded successfully and {autoNotify ? 'notification sent' : 'ready to send notification'}.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                {!uploadComplete ? (
                  <Button 
                    onClick={handleSingleUpload} 
                    disabled={isUploading || !singleMobile || !singleFile}
                    className="bg-red-600 hover:bg-red-700 flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload & Send Report'}
                  </Button>
                ) : (
                  <Button 
                    onClick={resetSingleUpload}
                    variant="outline"
                    className="flex-1"
                  >
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
              <CardDescription>Upload multiple reports at once with auto-mapping by mobile number</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bulk-files">Blood Reports (Multiple PDFs)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-400 transition-colors">
                  <input
                    id="bulk-files"
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleBulkFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <label htmlFor="bulk-files" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <Upload className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="text-gray-900">Click to upload or drag and drop</div>
                      <div className="text-gray-500 text-sm">Multiple PDF files (max 10MB each)</div>
                      <div className="text-gray-400 text-xs mt-2">File naming: [mobile-number].pdf</div>
                    </div>
                  </label>
                </div>
              </div>

              {bulkFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files ({bulkFiles.length})</Label>
                  <div className="border border-gray-200 rounded-lg divide-y max-h-60 overflow-y-auto">
                    {bulkFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-red-600" />
                          <div>
                            <div className="text-gray-900 text-sm">{file.name}</div>
                            <div className="text-gray-500 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
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
                    {bulkFiles.length} reports uploaded successfully and {autoNotify ? 'notifications sent' : 'ready to send notifications'}.
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
                    {isUploading ? 'Uploading...' : `Upload ${bulkFiles.length} Reports`}
                  </Button>
                ) : (
                  <Button 
                    onClick={resetBulkUpload}
                    variant="outline"
                    className="flex-1"
                  >
                    Upload More
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>Last 5 uploaded reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Rajesh Kumar', mobile: '+91 98765 43210', time: '2 hours ago', status: 'sent' },
              { name: 'Priya Sharma', mobile: '+91 98765 43211', time: '3 hours ago', status: 'sent' },
              { name: 'Amit Patel', mobile: '+91 98765 43212', time: '5 hours ago', status: 'pending' },
              { name: 'Sneha Reddy', mobile: '+91 98765 43213', time: '6 hours ago', status: 'sent' },
              { name: 'Vikram Singh', mobile: '+91 98765 43214', time: '8 hours ago', status: 'sent' },
            ].map((upload, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-gray-900">{upload.name}</div>
                    <div className="text-gray-500 text-sm">{upload.mobile}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={upload.status === 'sent' ? 'default' : 'secondary'}
                    className={upload.status === 'sent' ? 'bg-green-500' : ''}>
                    {upload.status}
                  </Badge>
                  <div className="text-gray-400 text-xs mt-1">{upload.time}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, FileText, QrCode, Printer } from "lucide-react"

interface Donor {
  _id: string;
  donorId: string;
  fullName: string;
  bloodGroup: string;
  mobileNumber: string;
  email: string;
  permanentAddress: string;
  cityStatePin: string;
  lastDonationDate?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  createdAt: string;
  registeredBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface DonorReceiptProps {
  donor: Donor;
  isOpen: boolean;
  onClose: () => void;
}

export default function DonorReceipt({ donor, isOpen, onClose }: DonorReceiptProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDFReceipt = async () => {
    setIsGenerating(true)
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Please allow popups to generate the receipt')
        return
      }

      const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Blood Donation Receipt - ${donor.donorId}</title>
          <style>
            @page { 
              size: A4; 
              margin: 0.5in;
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 0;
              background: white;
            }
            .header {
              background: #dc2626;
              color: white;
              padding: 20px;
              text-align: center;
              position: relative;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .header p {
              margin: 5px 0 0 0;
              font-size: 14px;
            }
            .logo {
              position: absolute;
              top: 20px;
              width: 40px;
              height: 40px;
              background: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #dc2626;
              font-weight: bold;
              font-size: 12px;
            }
            .logo.left { left: 20px; }
            .logo.right { right: 20px; }
            .content {
              padding: 20px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section h3 {
              background: #f3f4f6;
              padding: 10px;
              margin: 0 0 15px 0;
              color: #1f2937;
              font-size: 16px;
              font-weight: bold;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .info-item {
              display: flex;
              flex-direction: column;
            }
            .info-label {
              font-weight: bold;
              color: #374151;
              font-size: 12px;
              margin-bottom: 5px;
            }
            .info-value {
              color: #111827;
              font-size: 14px;
            }
            .qr-section {
              text-align: center;
              margin: 20px 0;
              padding: 20px;
              border: 2px dashed #d1d5db;
              border-radius: 8px;
            }
            .qr-placeholder {
              width: 120px;
              height: 120px;
              background: #f9fafb;
              border: 2px solid #d1d5db;
              margin: 0 auto 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 8px;
            }
            .footer {
              background: #f3f4f6;
              padding: 15px;
              text-align: center;
              margin-top: 30px;
              border-top: 2px solid #e5e7eb;
            }
            .footer p {
              margin: 5px 0;
              font-size: 12px;
              color: #374151;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo left">LOGO</div>
            <h1>BLOOD DONATION CAMP</h1>
            <p>Certificate of Blood Donation</p>
            <div class="logo right">LOGO</div>
          </div>
          
          <div class="content">
            <div class="section">
              <h3>DONOR INFORMATION</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Donor ID</span>
                  <span class="info-value">${donor.donorId}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Full Name</span>
                  <span class="info-value">${donor.fullName}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Blood Group</span>
                  <span class="info-value" style="font-weight: bold; color: #dc2626;">${donor.bloodGroup}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Mobile Number</span>
                  <span class="info-value">${donor.mobileNumber}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email</span>
                  <span class="info-value">${donor.email}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Status</span>
                  <span class="info-value" style="text-transform: uppercase; font-weight: bold;">${donor.status}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <h3>ADDRESS INFORMATION</h3>
              <div class="info-item">
                <span class="info-label">Address</span>
                <span class="info-value">${donor.permanentAddress}</span>
              </div>
              <div class="info-item" style="margin-top: 10px;">
                <span class="info-label">City/State</span>
                <span class="info-value">${donor.cityStatePin}</span>
              </div>
            </div>

            <div class="section">
              <h3>DONATION HISTORY</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Registration Date</span>
                  <span class="info-value">${new Date(donor.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Last Donation</span>
                  <span class="info-value">${donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>
            </div>

            <div class="qr-section">
              <h4 style="margin: 0 0 15px 0; color: #374151;">Verification QR Code</h4>
              <div class="qr-placeholder">
                <div style="font-size: 12px; color: #6b7280;">QR CODE</div>
              </div>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
                Scan to verify donor information
              </p>
            </div>
          </div>

          <div class="footer">
            <p><strong>Thank you for your life-saving contribution!</strong></p>
            <p>This certificate is valid for 3 months from the date of issue.</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `

      printWindow.document.write(receiptHTML)
      printWindow.document.close()
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
      }

    } catch (error) {
      console.error('Error generating receipt:', error)
      alert('Error generating receipt. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <FileText className="h-5 w-5" />
            Donor Receipt & Certificate
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Receipt Preview */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
            {/* Header */}
            <div className="bg-red-600 text-white p-4 rounded-t-lg -m-6 mb-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-xs">LOGO</span>
                </div>
                <div className="text-center">
                  <h1 className="text-xl font-bold">BLOOD DONATION CAMP</h1>
                  <p className="text-sm">Certificate of Blood Donation</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-xs">LOGO</span>
                </div>
              </div>
            </div>

            {/* QR Code and Donor Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Donor Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Donor ID</label>
                    <p className="text-sm text-gray-900 font-mono">{donor.donorId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-sm text-gray-900">{donor.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Blood Group</label>
                    <p className="text-sm text-gray-900 font-semibold">{donor.bloodGroup}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Mobile Number</label>
                    <p className="text-sm text-gray-900">{donor.mobileNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm text-gray-900">{donor.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className="text-sm text-gray-900 capitalize">{donor.status}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <h4 className="text-sm font-medium text-gray-600 mb-2">QR Code</h4>
                <div className="w-32 h-32 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Scan to verify donor information
                </p>
              </div>
            </div>

            {/* Address Section */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Address</h4>
              <p className="text-sm text-gray-900">{donor.permanentAddress}</p>
              <p className="text-sm text-gray-900">{donor.cityStatePin}</p>
            </div>

            {/* Dates Section */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Registration Date</label>
                <p className="text-sm text-gray-900">{new Date(donor.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Last Donation</label>
                <p className="text-sm text-gray-900">
                  {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              onClick={generatePDFReceipt}
              disabled={isGenerating}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Download PDF Receipt'}
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

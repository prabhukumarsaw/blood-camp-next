// @ts-nocheck

"use client"

/**
 * Premium Donor Certificate Component
 * Professional certificate with QR code verification
 *
 * Features:
 * - Dynamic QR code generation
 * - Premium professional design
 * - Perfect A4 landscape sizing
 * - Responsive print layout
 * - Gold accents and elegant typography
 * - Verification token
 * - Organization branding
 */

import { Button } from "@/components/ui/button"
import { Printer, Download } from "lucide-react"
import { format } from "date-fns"
import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
import { IconFileCertificate } from "@tabler/icons-react"

interface DonorCertificateProps {
  donor: any
  organizationName?: string
  organizationLogo?: string
  showIconOnly?: boolean
}

export function DonorCertificate({
  donor,
  organizationName = "Blood Donation Camp",
  organizationLogo,
  showIconOnly = false,
}: DonorCertificateProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [qrCode, setQrCode] = useState<string>("")

  useEffect(() => {
    // Generate QR code from donor verification data
    const verificationData = {
      donorId: donor.donorId,
      name: donor.fullName,
      bloodGroup: donor.bloodGroup,
      registrationDate: donor.createdAt,
      token: generateToken(donor.id, donor.createdAt),
    }

    QRCode.toDataURL(JSON.stringify(verificationData), {
      width: 280,
      margin: 1,
      color: {
        dark: "#1a1a1a",
        light: "#ffffff",
      },
    })
      .then((url) => setQrCode(url))
      .catch((err) => console.error("QR Code generation error:", err))
  }, [donor])

  const handlePrint = () => {
    if (!printRef.current) return
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow popups to print the certificate")
      return
    }

    const certificateHTML = generateCertificateHTML()
    printWindow.document.write(certificateHTML)
    printWindow.document.close()

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }

  const generateCertificateHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Blood Donor Certificate - ${donor.donorId}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0.4in 0.5in;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html, body {
            width: 100%;
            height: 100%;
          }
          body {
            font-family: 'Segoe UI', 'Trebuchet MS', sans-serif;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .certificate-container {
            position: relative;
            width: 11in;
            height: 8.5in;
            background: linear-gradient(135deg, #ffffff 0%, #f5f3f0 50%, #ffffff 100%);
            border: 3px solid #d4af37;
            padding: 32px 36px;
            box-shadow: inset 0 0 60px rgba(212, 175, 55, 0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          .certificate-corner {
            position: absolute;
            width: 40px;
            height: 40px;
            border: 2px solid #d4af37;
          }
          .corner-tl {
            top: 12px;
            left: 12px;
            border-right: none;
            border-bottom: none;
          }
          .corner-tr {
            top: 12px;
            right: 12px;
            border-left: none;
            border-bottom: none;
          }
          .corner-bl {
            bottom: 12px;
            left: 12px;
            border-right: none;
            border-top: none;
          }
          .corner-br {
            bottom: 12px;
            right: 12px;
            border-left: none;
            border-top: none;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: rgba(212, 175, 55, 0.03);
            font-weight: 900;
            z-index: 0;
            white-space: nowrap;
            letter-spacing: 15px;
          }
          .content {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            height: 100%;
            gap: 16px;
          }
          .header-section {
            text-align: center;
            flex-shrink: 0;
            padding-bottom: 8px;
          }
          .header-section h1 {
            font-size: 40px;
            color: #8B0000;
            margin: 0 0 2px 0;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            line-height: 1.1;
          }
          .header-section p {
            font-size: 12px;
            color: #666;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin: 2px 0;
          }
          .organization-name {
            font-size: 18px;
            color: #d4af37;
            font-weight: 600;
            margin-top: 4px;
          }
          .main-content {
            flex: 1;
            display: grid;
            grid-template-columns: 1.4fr 1fr;
            gap: 28px;
            align-items: center;
            min-height: 0;
            padding: 12px 0;
          }
          .certificate-text {
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 0;
          }
          .certificate-intro {
            font-size: 14px;
            color: #333;
            line-height: 1.6;
            margin-bottom: 8px;
            font-weight: 500;
          }
          .donor-name {
            font-size: 36px;
            color: #8B0000;
            font-weight: 700;
            margin: 10px 0;
            text-decoration: underline;
            text-decoration-color: #d4af37;
            text-underline-offset: 8px;
            text-decoration-thickness: 3px;
            line-height: 1.2;
          }
          .certification-text {
            font-size: 13px;
            color: #555;
            line-height: 1.6;
            margin: 10px 0;
            font-style: italic;
          }
          .donor-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 20px;
            padding: 14px;
            background: rgba(212, 175, 55, 0.05);
            border-radius: 6px;
            margin: 12px 0;
          }
          .detail-item {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            font-size: 12px;
            padding: 4px 0;
          }
          .detail-label {
            font-weight: 600;
            color: #333;
            flex-shrink: 0;
          }
          .detail-value {
            color: #555;
            text-align: right;
            flex: 1;
          }
          .qr-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 0;
          }
          .qr-container {
            background: white;
            padding: 12px;
            border: 2px solid #d4af37;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            flex-shrink: 0;
          }
          .qr-code {
            width: 160px;
            height: 160px;
            display: block;
          }
          .qr-label {
            font-size: 10px;
            color: #666;
            margin-top: 8px;
            text-align: center;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            flex-shrink: 0;
          }
          .verification-token {
            font-size: 9px;
            color: #999;
            margin-top: 6px;
            word-break: break-all;
            text-align: center;
            font-family: 'Courier New', monospace;
            flex-shrink: 0;
          }
          .footer-section {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            padding-top: 12px;
            border-top: 2px solid #d4af37;
            flex-shrink: 0;
          }
          .signature-box {
            text-align: center;
          }
          .signature-line {
            width: 100%;
            height: 1px;
            background: #333;
            margin-bottom: 6px;
          }
          .signature-label {
            font-size: 11px;
            color: #333;
            font-weight: 600;
          }
          .footer-text {
            grid-column: 1 / -1;
            text-align: center;
            font-size: 10px;
            color: #999;
            margin-top: 8px;
            line-height: 1.4;
          }
          .certificate-id {
            font-family: 'Courier New', monospace;
            font-size: 9px;
            color: #666;
            font-weight: 600;
          }
          @media print {
            html, body {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              display: block;
              background: white;
            }
            .certificate-container {
              margin: 0;
              width: 100%;
              height: 100%;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <div class="certificate-corner corner-tl"></div>
          <div class="certificate-corner corner-tr"></div>
          <div class="certificate-corner corner-bl"></div>
          <div class="certificate-corner corner-br"></div>
          <div class="watermark">BLOOD DONOR</div>
          
          <div class="content">
            <div class="header-section">
              <h1>Certificate of Registration</h1>
              <p>Blood Donation Services</p>
              <div class="organization-name">${organizationName}</div>
            </div>
            
            <div class="main-content">
              <div class="certificate-text">
                <div class="certificate-intro">
                  This is to certify that
                </div>
                <div class="donor-name">
                  ${donor.fullName}
                </div>
                <div class="certification-text">
                  has been successfully registered as a voluntary blood donor and meets all the eligibility criteria for blood donation.
                </div>
                
                <div class="donor-details">
                  <div class="detail-item">
                    <span class="detail-label">Donor ID:</span>
                    <span class="detail-value">${donor.donorId}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Blood Group:</span>
                    <span class="detail-value">${formatBloodGroup(donor.bloodGroup)}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Date of Birth:</span>
                    <span class="detail-value">${format(new Date(donor.dateOfBirth), "dd MMM yyyy")}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Registered On:</span>
                    <span class="detail-value">${format(new Date(donor.createdAt), "dd MMM yyyy")}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Contact:</span>
                    <span class="detail-value">${donor.mobileNumber}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">${donor.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>
              
              <div class="qr-section">
                <div class="qr-container">
                  <img src="${qrCode}" alt="QR Code" class="qr-code">
                </div>
                <div class="qr-label">Scan to Verify</div>
                <div class="verification-token">
                  Token: ${generateToken(donor.id, donor.createdAt)}
                </div>
              </div>
            </div>
            
            <div class="footer-section">
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Authorized Medical Officer</div>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Organization Seal</div>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Camp Coordinator</div>
              </div>
              <div class="footer-text">
                <strong>Thank you for your life-saving contribution!</strong><br>
                Certificate ID: <span class="certificate-id">${donor.donorId}-${format(new Date(donor.createdAt), "yyyyMMdd")}</span> | 
                Generated: ${format(new Date(), "dd MMM yyyy")}
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = qrCode
    link.download = `donor-certificate-${donor.donorId}.png`
    link.click()
  }

  if (showIconOnly) {
    return (
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handlePrint} title="Print Certificate">
          <Printer className="h-4 w-4" />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleDownload} title="Download Certificate">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div ref={printRef} className="certificate-print hidden">
        {/* Certificate content will be generated in print window */}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrint}
          className="flex items-center gap-2 "
        >
          <IconFileCertificate className="h-4 w-4" />
        </Button>
        {/* <Button
          type="button"
          variant="outline"
          onClick={handleDownload}
          className="flex items-center gap-2 bg-transparent"
        >
          <Download className="h-4 w-4" />
          Download QR Code
        </Button> */}
      </div>
    </div>
  )
}

/**
 * Generate registration token with timestamp
 */
function generateToken(id: string, createdAt: Date): string {
  const timestamp = new Date(createdAt).getTime().toString(36)
  const idHash = id.substring(0, 8).toUpperCase()
  return `${idHash}-${timestamp}`.toUpperCase()
}

/**
 * Format blood group display
 */
function formatBloodGroup(bloodGroup: string): string {
  return bloodGroup.replace(/_POS$/, "+").replace(/_NEG$/, "-")
}

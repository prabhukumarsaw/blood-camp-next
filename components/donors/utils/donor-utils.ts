import { format } from "date-fns";

/**
 * Donor Utility Functions
 * Helper functions for donor data processing and formatting
 */

/**
 * Generate registration certificate content
 * Creates formatted text certificate for download
 * 
 * @param donor - Donor data object
 * @returns Formatted certificate text
 */
export function generateDonorCertificate(donor: any): string {
  return `
BLOOD DONOR REGISTRATION CERTIFICATE
=====================================

Donor ID: ${donor.donorId}
Registration Date: ${format(new Date(donor.createdAt), "dd MMM yyyy")}

PERSONAL INFORMATION
--------------------
Name: ${donor.fullName}
Date of Birth: ${format(new Date(donor.dateOfBirth), "dd MMM yyyy")}
Gender: ${donor.gender}
Blood Group: ${donor.bloodGroup}
Weight: ${donor.weight} kg
Height: ${donor.height} cm

CONTACT INFORMATION
-------------------
Mobile: ${donor.mobileNumber}
Email: ${donor.email || "N/A"}
Aadhar: ${donor.aadharNumber || "N/A"}

ADDRESS
-------
${donor.permanentAddress}
${donor.city}, ${donor.state} - ${donor.pincode}

MEDICAL STATUS
--------------
Eligible for Donation: ${donor.eligibleForDonation ? "Yes" : "No"}
Regular Donor: ${donor.willingToBeRegularDonor ? "Yes" : "No"}
Status: ${donor.status}

NOTIFICATION PREFERENCES
------------------------
${donor.notificationPreference.join(", ")}

Thank you for registering as a blood donor!
Your contribution saves lives.

Generated on: ${format(new Date(), "dd MMM yyyy 'at' hh:mm a")}
  `.trim();
}

/**
 * Download certificate as text file
 * 
 * @param content - Certificate content
 * @param donorId - Donor ID for filename
 */
export function downloadCertificate(content: string, donorId: string): void {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `donor-registration-${donorId}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


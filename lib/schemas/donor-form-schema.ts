import { z } from "zod";
import { BloodGroup, Gender, NotificationPreference } from "@prisma/client";

/**
 * Donor Registration Form Schema
 * Comprehensive validation for donor registration
 */

// Blood group mapping for form
export const BLOOD_GROUP_OPTIONS = [
  { value: "A_POS", label: "A+" },
  { value: "A_NEG", label: "A-" },
  { value: "B_POS", label: "B+" },
  { value: "B_NEG", label: "B-" },
  { value: "AB_POS", label: "AB+" },
  { value: "AB_NEG", label: "AB-" },
  { value: "O_POS", label: "O+" },
  { value: "O_NEG", label: "O-" },
] as const;

// Gender options
export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

// Notification preference options
export const NOTIFICATION_OPTIONS = [
  { value: "SMS", label: "SMS" },
  { value: "EMAIL", label: "Email" },
  { value: "PUSH", label: "Push Notification" },
] as const;

// Validation helpers
const phoneRegex = /^[6-9]\d{9}$/;
const aadharRegex = /^\d{12}$/;
const pincodeRegex = /^\d{6}$/;

export const donorFormSchema = z.object({
  // Personal Information
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name should only contain letters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name should only contain letters"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
          ? age - 1 
          : age;
        return actualAge >= 18 && actualAge <= 65;
      },
      { message: "Age must be between 18 and 65 years" }
    ),
  gender: z.nativeEnum(Gender, {
    errorMap: () => ({ message: "Please select a valid gender" }),
  }),

  // Physical Details
  bloodGroup: z.nativeEnum(BloodGroup, {
    errorMap: () => ({ message: "Please select a blood group" }),
  }),
  weight: z
    .string()
    .min(1, "Weight is required")
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 45 && num <= 150;
      },
      { message: "Weight must be between 45 and 150 kg" }
    ),
  height: z
    .string()
    .min(1, "Height is required")
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 140 && num <= 220;
      },
      { message: "Height must be between 140 and 220 cm" }
    ),

  // Contact Information
  mobileNumber: z
    .string()
    .min(10, "Mobile number must be 10 digits")
    .max(10, "Mobile number must be 10 digits")
    .regex(phoneRegex, "Invalid mobile number format"),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  aadharNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || aadharRegex.test(val),
      { message: "Aadhar number must be 12 digits" }
    )
    .or(z.literal("")),

  // Address
  permanentAddress: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must not exceed 200 characters"),
  city: z
    .string()
    .min(2, "City is required")
    .max(50, "City name must not exceed 50 characters"),
  state: z
    .string()
    .min(2, "State is required")
    .max(50, "State name must not exceed 50 characters"),
  pincode: z
    .string()
    .min(6, "Pincode must be 6 digits")
    .max(6, "Pincode must be 6 digits")
    .regex(pincodeRegex, "Invalid pincode format"),

  // Emergency Contact
  emergencyContactName: z
    .string()
    .min(2, "Emergency contact name is required")
    .max(50, "Name must not exceed 50 characters")
    .optional(),
  emergencyContactNumber: z
    .string()
    .min(10, "Emergency contact number must be 10 digits")
    .max(10, "Emergency contact number must be 10 digits")
    .regex(phoneRegex, "Invalid mobile number format")
    .optional(),

  // Medical Information
  takingMedication: z.boolean().default(false),
  medicationDetails: z.string().max(500, "Details must not exceed 500 characters").optional(),
  chronicIllness: z.boolean().default(false),
  illnessDetails: z.string().max(500, "Details must not exceed 500 characters").optional(),
  donatedBefore: z.boolean().default(false),
  lastDonationDate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return date <= new Date();
      },
      { message: "Last donation date cannot be in the future" }
    ),
  surgeryInLast6Months: z.boolean().default(false),
  surgeryDetails: z.string().max(500, "Details must not exceed 500 characters").optional(),
  smokeOrAlcohol: z.boolean().default(false),
  eligibleForDonation: z.boolean().default(false),
  medicalNotes: z.string().max(1000, "Notes must not exceed 1000 characters").optional(),

  // Preferences
  willingToBeRegularDonor: z.boolean().default(false),
  notificationPreference: z
    .array(z.nativeEnum(NotificationPreference))
    .min(1, "Select at least one notification preference")
    .default([]),

  // Consent
  consentToUseData: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must consent to data usage",
    }),
  confirmInformationAccurate: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must confirm information accuracy",
    }),
}).refine(
  (data) => {
    if (data.takingMedication && !data.medicationDetails) {
      return false;
    }
    return true;
  },
  {
    message: "Please provide medication details",
    path: ["medicationDetails"],
  }
).refine(
  (data) => {
    if (data.chronicIllness && !data.illnessDetails) {
      return false;
    }
    return true;
  },
  {
    message: "Please provide illness details",
    path: ["illnessDetails"],
  }
).refine(
  (data) => {
    if (data.surgeryInLast6Months && !data.surgeryDetails) {
      return false;
    }
    return true;
  },
  {
    message: "Please provide surgery details",
    path: ["surgeryDetails"],
  }
);

export type DonorFormData = z.infer<typeof donorFormSchema>;

// Storage key for draft
export const DONOR_DRAFT_STORAGE_KEY = "donor_registration_draft";


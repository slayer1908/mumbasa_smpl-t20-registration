import { z } from "zod";

export const PLAYER_ROLES = [
  "Batsman",
  "Bowler",
  "All-Rounder",
  "Wicket Keeper",
] as const;

export const BATTING_STYLES = ["Right Hand Batsman", "Left Hand Batsman"] as const;

export const BOWLING_STYLES = [
  "Right Arm Fast",
  "Left Arm Fast",
  "Right Arm Medium",
  "Left Arm Medium",
  "Right Arm Spin",
  "Left Arm Spin",
  "Not Applicable",
] as const;

export const PAYMENT_METHODS = ["UPI / QR", "Bank Transfer"] as const;

export const PAYMENT_STATUSES = ["pending", "verified", "rejected"] as const;

// Server-side schema for the text fields of the registration form.
// File upload is validated separately (multipart/form-data) in the API route.
export const registrationSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .max(120, "Full name is too long"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(/^[0-9+\-\s()]+$/, "Phone number contains invalid characters"),
  whatsapp: z
    .string()
    .trim()
    .min(7, "Enter a valid WhatsApp number")
    .max(20, "WhatsApp number is too long")
    .regex(/^[0-9+\-\s()]+$/, "WhatsApp number contains invalid characters"),
  email: z.string().trim().email("Enter a valid email address"),
  city_country: z
    .string()
    .trim()
    .min(2, "City / Country is required")
    .max(120, "City / Country is too long"),
  player_role: z.enum(PLAYER_ROLES, {
    errorMap: () => ({ message: "Select a valid player role" }),
  }),
  batting_style: z.enum(BATTING_STYLES, {
    errorMap: () => ({ message: "Select a valid batting style" }),
  }),
  bowling_style: z.enum(BOWLING_STYLES, {
    errorMap: () => ({ message: "Select a valid bowling style" }),
  }),
  payment_method: z.enum(PAYMENT_METHODS, {
    errorMap: () => ({ message: "Select a valid payment method" }),
  }),
  utr_transaction_id: z
    .string()
    .trim()
    .min(4, "Enter a valid UTR / Transaction ID")
    .max(60, "UTR / Transaction ID is too long"),
  payment_sender_name: z
    .string()
    .trim()
    .min(3, "Enter the name the payment was sent from")
    .max(120, "Payment sender name is too long"),
  agree_terms: z
    .union([z.literal("true"), z.literal("on"), z.boolean()])
    .refine((v) => v === true || v === "true" || v === "on", {
      message: "You must agree to the Terms & Conditions",
    }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const ACCEPTED_PROOF_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
];

export const MAX_PROOF_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const paymentStatusSchema = z.object({
  payment_status: z.enum(PAYMENT_STATUSES),
});

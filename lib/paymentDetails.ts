// Payment details used across the site. Values must match exactly as
// provided by the organizer — do not alter spelling, numbers, IFSC,
// UPI ID, account number, or account holder name.

export const UPI_DETAILS = {
  name: "Neha Verma",
  upiId: "anuneh202614jan@oksbi",
};

export const BANK_DETAILS = {
  accountHolderName: "Neha Verma",
  accountNumber: "45280334404",
  accountType: "Savings Account",
  bankName: "SBI",
  branch: "CHILKANA ROAD",
  ifsc: "SBIN0006688",
};

export const REGISTRATION_FEE =
  process.env.NEXT_PUBLIC_REGISTRATION_FEE || "2500";

export const EVENT_NAME =
  process.env.NEXT_PUBLIC_EVENT_NAME ||
  "Summer Mombasa Premier League T20";

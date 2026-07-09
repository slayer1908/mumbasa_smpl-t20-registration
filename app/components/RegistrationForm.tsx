"use client";

import { useState, useRef } from "react";
import {
  PLAYER_ROLES,
  BATTING_STYLES,
  BOWLING_STYLES,
  PAYMENT_METHODS,
} from "@/lib/validators";

type FieldErrors = Record<string, string[] | undefined>;

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; registrationId: string }
  | { status: "error"; message: string };

const inputClasses =
  "w-full rounded-lg bg-pitch-900 border border-gold-700/30 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500/60 focus:border-gold-500/60 transition";

const labelClasses = "block text-sm font-medium text-gray-200 mb-1.5";

const errorClasses = "mt-1 text-xs text-red-400";

export default function RegistrationForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [fileName, setFileName] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Normalize checkbox value explicitly so it's always present.
    const agreed = formData.get("agree_terms") === "on";
    formData.set("agree_terms", agreed ? "true" : "false");

    if (!agreed) {
      setFieldErrors({
        agree_terms: ["You must agree to the Terms & Conditions"],
      });
      return;
    }

    setSubmitState({ status: "submitting" });

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setFieldErrors(result.errors || {});
        setSubmitState({
          status: "error",
          message:
            result.message || "Something went wrong. Please try again.",
        });
        return;
      }

      setSubmitState({
        status: "success",
        registrationId: result.registrationId,
      });
      form.reset();
      setFileName("");
    } catch {
      setSubmitState({
        status: "error",
        message:
          "Network error. Please check your connection and try again.",
      });
    }
  }

  if (submitState.status === "success") {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-glow/15 border border-emerald-glow/40">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-emerald-glow"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-50 mb-2">
          Registration submitted successfully.
        </h3>
        <p className="text-gray-300 mb-1">
          Your registration will be confirmed after payment verification.
        </p>
        <p className="text-gold-400 font-medium">
          Please keep your UTR/Transaction ID safe for future reference.
        </p>
        <button
          type="button"
          onClick={() => setSubmitState({ status: "idle" })}
          className="mt-6 inline-flex items-center rounded-lg border border-gold-600/50 px-5 py-2.5 text-sm font-medium text-gold-400 hover:bg-gold-600/10 transition"
        >
          Register another player
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="card p-6 sm:p-8 space-y-8"
    >
      {submitState.status === "error" && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {submitState.message}
        </div>
      )}

      {/* Player details */}
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold gold-gradient-text mb-1">
          Player Details
        </legend>

        <div>
          <label className={labelClasses} htmlFor="full_name">
            Full Name <span className="text-gold-500">*</span>
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            placeholder="Enter your full name"
            className={inputClasses}
          />
          <FieldError errors={fieldErrors.full_name} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClasses} htmlFor="phone">
              Phone Number <span className="text-gold-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="+91 98765 43210"
              className={inputClasses}
            />
            <FieldError errors={fieldErrors.phone} />
          </div>
          <div>
            <label className={labelClasses} htmlFor="whatsapp">
              WhatsApp Number <span className="text-gold-500">*</span>
            </label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              required
              placeholder="+91 98765 43210"
              className={inputClasses}
            />
            <FieldError errors={fieldErrors.whatsapp} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClasses} htmlFor="email">
              Email Address <span className="text-gold-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className={inputClasses}
            />
            <FieldError errors={fieldErrors.email} />
          </div>
          <div>
            <label className={labelClasses} htmlFor="city_country">
              City / Country <span className="text-gold-500">*</span>
            </label>
            <input
              id="city_country"
              name="city_country"
              type="text"
              required
              placeholder="Mumbai, India"
              className={inputClasses}
            />
            <FieldError errors={fieldErrors.city_country} />
          </div>
        </div>
      </fieldset>

      {/* Playing profile */}
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold gold-gradient-text mb-1">
          Playing Profile
        </legend>

        <div>
          <label className={labelClasses} htmlFor="player_role">
            Player Role <span className="text-gold-500">*</span>
          </label>
          <select
            id="player_role"
            name="player_role"
            required
            defaultValue=""
            className={inputClasses}
          >
            <option value="" disabled>
              Select player role
            </option>
            {PLAYER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <FieldError errors={fieldErrors.player_role} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClasses} htmlFor="batting_style">
              Batting Style <span className="text-gold-500">*</span>
            </label>
            <select
              id="batting_style"
              name="batting_style"
              required
              defaultValue=""
              className={inputClasses}
            >
              <option value="" disabled>
                Select batting style
              </option>
              {BATTING_STYLES.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
            <FieldError errors={fieldErrors.batting_style} />
          </div>
          <div>
            <label className={labelClasses} htmlFor="bowling_style">
              Bowling Style <span className="text-gold-500">*</span>
            </label>
            <select
              id="bowling_style"
              name="bowling_style"
              required
              defaultValue=""
              className={inputClasses}
            >
              <option value="" disabled>
                Select bowling style
              </option>
              {BOWLING_STYLES.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
            <FieldError errors={fieldErrors.bowling_style} />
          </div>
        </div>
      </fieldset>

      {/* Payment */}
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold gold-gradient-text mb-1">
          Payment Confirmation
        </legend>
        <p className="text-xs text-gray-400 -mt-2">
          Complete your payment using the UPI/QR or Bank Transfer details
          above, then fill in the confirmation below.
        </p>

        <div>
          <label className={labelClasses} htmlFor="payment_method">
            Payment Method <span className="text-gold-500">*</span>
          </label>
          <select
            id="payment_method"
            name="payment_method"
            required
            defaultValue=""
            className={inputClasses}
          >
            <option value="" disabled>
              Select payment method
            </option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
          <FieldError errors={fieldErrors.payment_method} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClasses} htmlFor="utr_transaction_id">
              UTR / Transaction ID <span className="text-gold-500">*</span>
            </label>
            <input
              id="utr_transaction_id"
              name="utr_transaction_id"
              type="text"
              required
              placeholder="e.g. 402816xxxxxx"
              className={inputClasses}
            />
            <FieldError errors={fieldErrors.utr_transaction_id} />
          </div>
          <div>
            <label className={labelClasses} htmlFor="payment_sender_name">
              Payment Sender Name <span className="text-gold-500">*</span>
            </label>
            <input
              id="payment_sender_name"
              name="payment_sender_name"
              type="text"
              required
              placeholder="Name shown on the payment"
              className={inputClasses}
            />
            <FieldError errors={fieldErrors.payment_sender_name} />
          </div>
        </div>

        <div>
          <label className={labelClasses} htmlFor="payment_proof">
            Payment Proof Screenshot / Receipt{" "}
            <span className="text-gold-500">*</span>
          </label>
          <div className="relative">
            <input
              id="payment_proof"
              name="payment_proof"
              type="file"
              required
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
              className="block w-full text-sm text-gray-300 rounded-lg border border-dashed border-gold-700/40 bg-pitch-900 file:mr-4 file:rounded-md file:border-0 file:bg-gold-600/20 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-gold-400 hover:file:bg-gold-600/30 cursor-pointer px-1 py-1"
            />
          </div>
          {fileName && (
            <p className="mt-1 text-xs text-emerald-glow">
              Selected: {fileName}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            PNG, JPG, WEBP or PDF. Max size 5MB.
          </p>
          <FieldError errors={fieldErrors.payment_proof} />
        </div>
      </fieldset>

      {/* Terms */}
      <div className="rounded-lg border border-gold-700/25 bg-pitch-900/60 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="agree_terms"
            className="mt-0.5 h-4 w-4 rounded border-gold-700/50 bg-pitch-900 text-gold-600 focus:ring-gold-500"
          />
          <span className="text-sm text-gray-300">
            I agree to the{" "}
            <a
              href="/terms"
              target="_blank"
              className="text-gold-400 underline underline-offset-2 hover:text-gold-300"
            >
              Terms &amp; Conditions
            </a>{" "}
            and understand that registration fees are non-refundable.
          </span>
        </label>
        <FieldError errors={fieldErrors.agree_terms} />
      </div>

      <button
        type="submit"
        disabled={submitState.status === "submitting"}
        className="w-full rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-6 py-3.5 text-center text-sm font-semibold text-pitch-950 shadow-lg shadow-gold-900/20 transition hover:from-gold-500 hover:to-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitState.status === "submitting" ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Submitting registration...
          </span>
        ) : (
          "Submit Registration"
        )}
      </button>

      <p className="text-center text-xs text-gray-500">
        Registration is confirmed only after your payment is manually
        verified by the organizers.
      </p>
    </form>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;
  return <p className={errorClasses}>{errors[0]}</p>;
}

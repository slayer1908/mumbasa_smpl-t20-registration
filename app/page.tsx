import Image from "next/image";
import Link from "next/link";
import RegistrationForm from "./components/RegistrationForm";
import {
  UPI_DETAILS,
  BANK_DETAILS,
  REGISTRATION_FEE,
  EVENT_NAME,
} from "@/lib/paymentDetails";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gold-700/15">
        <div className="mx-auto max-w-5xl px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="SMPL T20 Logo"
              width={48}
              height={48}
              className="rounded-full"
              priority
            />
            <div>
              <p className="text-sm font-semibold text-gray-100 leading-tight">
                {EVENT_NAME}
              </p>
              <p className="text-xs text-gold-500 leading-tight">
                Player Registration
              </p>
            </div>
          </div>
          <Link
            href="/terms"
            className="text-sm text-gray-300 hover:text-gold-400 transition"
          >
            Terms &amp; Conditions
          </Link>
        </div>
      </header>

      {/* Poster / Banner */}
      <section className="mx-auto max-w-5xl px-4 pt-8">
        <div className="relative overflow-hidden rounded-2xl border border-gold-700/20 shadow-2xl shadow-black/40">
          <Image
            src="/poster.png"
            alt="Summer Mombasa Premier League T20 - Kenya Tour"
            width={1600}
            height={700}
            className="w-full h-auto"
            priority
          />
        </div>
      </section>

      {/* Intro / Fee */}
      <section className="mx-auto max-w-5xl px-4 pt-10 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-50">
          Register as an Individual Player
        </h1>
        <p className="mt-3 text-gray-400 max-w-2xl mx-auto">
          Secure your spot for the {EVENT_NAME} Kenya Tour. Registration is
          open to individual players only — no team registration required.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold-600/40 bg-gold-600/10 px-6 py-2.5">
          <span className="text-sm text-gray-300">Registration Fee</span>
          <span className="text-lg font-bold gold-gradient-text">
            ₹{REGISTRATION_FEE}
          </span>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        <div className="stitch-divider my-10" />
      </div>

      {/* Payment Section */}
      <section className="mx-auto max-w-5xl px-4">
        <h2 className="text-xl font-semibold text-gray-50 mb-1">
          Payment Instructions
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Pay the registration fee using either option below, then complete
          the form with your payment details and upload proof.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* UPI / QR */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-glow/15 text-emerald-glow text-sm font-bold">
                1
              </span>
              <h3 className="font-semibold text-gray-100">UPI / QR Payment</h3>
            </div>
            <div className="flex justify-center mb-4">
              <div className="rounded-xl border border-gold-700/25 bg-white p-2">
                <Image
                  src="/qr.png"
                  alt="UPI QR Code for payment"
                  width={220}
                  height={220}
                  className="rounded-lg"
                />
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-400">UPI Name</dt>
                <dd className="text-gray-100 font-medium">
                  {UPI_DETAILS.name}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-400">UPI ID</dt>
                <dd className="text-gray-100 font-medium break-all text-right">
                  {UPI_DETAILS.upiId}
                </dd>
              </div>
            </dl>
          </div>

          {/* Bank Transfer */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-glow/15 text-emerald-glow text-sm font-bold">
                2
              </span>
              <h3 className="font-semibold text-gray-100">Bank Transfer</h3>
            </div>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-400">Account Holder</dt>
                <dd className="text-gray-100 font-medium text-right">
                  {BANK_DETAILS.accountHolderName}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-400">Account Number</dt>
                <dd className="text-gray-100 font-medium">
                  {BANK_DETAILS.accountNumber}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-400">Account Type</dt>
                <dd className="text-gray-100 font-medium">
                  {BANK_DETAILS.accountType}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-400">Bank Name</dt>
                <dd className="text-gray-100 font-medium">
                  {BANK_DETAILS.bankName}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-400">Branch</dt>
                <dd className="text-gray-100 font-medium text-right">
                  {BANK_DETAILS.branch}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-400">IFSC</dt>
                <dd className="text-gray-100 font-medium">
                  {BANK_DETAILS.ifsc}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Trust notice */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-gold-600/30 bg-gold-600/5 p-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 flex-shrink-0 text-gold-500 mt-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m0 3.75h.007M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-gray-300">
            Your registration is <span className="text-gold-400">confirmed only after payment verification</span> by
            the organizers. Please double-check the payment details above
            before transferring, and keep your UTR/Transaction ID safe.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        <div className="stitch-divider my-10" />
      </div>

      {/* Registration Form */}
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <h2 className="text-xl font-semibold text-gray-50 mb-1 text-center">
          Player Registration Form
        </h2>
        <p className="text-sm text-gray-400 mb-6 text-center">
          Fields marked <span className="text-gold-500">*</span> are
          required.
        </p>
        <RegistrationForm />
      </section>

      <footer className="border-t border-gold-700/15 py-8">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} {EVENT_NAME}. All rights
            reserved.
          </p>
          <Link href="/terms" className="hover:text-gold-400 transition">
            Terms &amp; Conditions
          </Link>
        </div>
      </footer>
    </main>
  );
}

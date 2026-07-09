import Link from "next/link";
import type { Metadata } from "next";
import { REGISTRATION_FEE, EVENT_NAME } from "@/lib/paymentDetails";

export const metadata: Metadata = {
  title: `Terms & Conditions | ${EVENT_NAME}`,
};

const terms = [
  `The player registration fee is ₹${REGISTRATION_FEE}.`,
  "The registration fee is strictly non-refundable under any circumstances, including withdrawal, injury, visa issues, or event changes.",
  "Registration is provisional upon submission and is confirmed only after the organizers manually verify the payment proof and transaction details.",
  "Fake, edited, incorrect, duplicate, or missing payment proof may lead to rejection of the registration without refund.",
  "All player details submitted (name, contact information, playing role, batting/bowling style, etc.) must be accurate and truthful. Incorrect information may result in disqualification.",
  "Organizers reserve the right to reject any registration that is incomplete, suspicious, fraudulent, or does not meet event requirements.",
  "The organizers' decision on all matters related to registration, verification, team selection, and event conduct will be final and binding.",
  "The event schedule, selection process, tour itinerary, or any other aspect of the event may be changed, postponed, or modified by the organizers if required, without prior notice.",
];

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-gold-700/15">
        <div className="mx-auto max-w-3xl px-4 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-gray-300 hover:text-gold-400 transition"
          >
            ← Back to Registration
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl sm:text-3xl font-bold gold-gradient-text mb-2">
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          {EVENT_NAME} — Kenya Tour Player Registration
        </p>

        <div className="card p-6 sm:p-8">
          <ol className="space-y-5">
            {terms.map((term, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-gold-600/40 bg-gold-600/10 text-xs font-semibold text-gold-400">
                  {index + 1}
                </span>
                <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                  {term}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          By submitting the registration form, you confirm that you have
          read, understood, and agreed to all the terms listed above.
        </p>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-gold-600/50 px-5 py-2.5 text-sm font-medium text-gold-400 hover:bg-gold-600/10 transition"
          >
            ← Back to Registration Form
          </Link>
        </div>
      </section>
    </main>
  );
}

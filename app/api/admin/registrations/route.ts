import { NextRequest, NextResponse } from "next/server";
import {
  supabaseAdmin,
  REGISTRATIONS_TABLE,
  PROOFS_BUCKET,
} from "@/lib/supabaseAdmin";
import { isAuthorizedAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";

const SIGNED_URL_EXPIRY_SECONDS = 60 * 60; // 1 hour

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data: registrations, error } = await supabaseAdmin
    .from(REGISTRATIONS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase select error:", error.message);
    return NextResponse.json(
      { success: false, message: "Could not load registrations." },
      { status: 500 }
    );
  }

  // Attach a short-lived signed URL for each payment proof so the
  // admin can view it without the bucket being public.
  const withSignedUrls = await Promise.all(
    (registrations || []).map(async (registration) => {
      if (!registration.payment_proof_path) {
        return { ...registration, payment_proof_url: null };
      }

      const { data: signedData, error: signedError } =
        await supabaseAdmin.storage
          .from(PROOFS_BUCKET)
          .createSignedUrl(
            registration.payment_proof_path,
            SIGNED_URL_EXPIRY_SECONDS
          );

      if (signedError) {
        console.error("Signed URL error:", signedError.message);
        return { ...registration, payment_proof_url: null };
      }

      return {
        ...registration,
        payment_proof_url: signedData?.signedUrl ?? null,
      };
    })
  );

  return NextResponse.json({ success: true, registrations: withSignedUrls });
}

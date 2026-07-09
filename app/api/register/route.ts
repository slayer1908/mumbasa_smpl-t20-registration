import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  supabaseAdmin,
  REGISTRATIONS_TABLE,
  PROOFS_BUCKET,
} from "@/lib/supabaseAdmin";
import {
  registrationSchema,
  ACCEPTED_PROOF_TYPES,
  MAX_PROOF_SIZE_BYTES,
} from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const rawFields = {
      full_name: formData.get("full_name")?.toString() ?? "",
      phone: formData.get("phone")?.toString() ?? "",
      whatsapp: formData.get("whatsapp")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      city_country: formData.get("city_country")?.toString() ?? "",
      player_role: formData.get("player_role")?.toString() ?? "",
      batting_style: formData.get("batting_style")?.toString() ?? "",
      bowling_style: formData.get("bowling_style")?.toString() ?? "",
      payment_method: formData.get("payment_method")?.toString() ?? "",
      utr_transaction_id: formData.get("utr_transaction_id")?.toString() ?? "",
      payment_sender_name:
        formData.get("payment_sender_name")?.toString() ?? "",
      agree_terms: formData.get("agree_terms")?.toString() ?? "",
    };

    const parsed = registrationSchema.safeParse(rawFields);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          success: false,
          message: "Please fix the highlighted fields and try again.",
          errors: fieldErrors,
        },
        { status: 400 }
      );
    }

    const proofFile = formData.get("payment_proof");

    if (!(proofFile instanceof File) || proofFile.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment proof screenshot / receipt is required.",
          errors: { payment_proof: ["Payment proof file is required"] },
        },
        { status: 400 }
      );
    }

    if (!ACCEPTED_PROOF_TYPES.includes(proofFile.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment proof must be an image (PNG/JPG/WEBP) or PDF.",
          errors: {
            payment_proof: ["Unsupported file type"],
          },
        },
        { status: 400 }
      );
    }

    if (proofFile.size > MAX_PROOF_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment proof file must be smaller than 5MB.",
          errors: {
            payment_proof: ["File too large"],
          },
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Build a unique, collision-safe storage path for the proof file.
    const registrationId = randomUUID();
    const fileExtension =
      proofFile.name.split(".").pop()?.toLowerCase().slice(0, 10) || "dat";
    const storagePath = `${registrationId}/${randomUUID()}.${fileExtension}`;

    const fileBuffer = Buffer.from(await proofFile.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(PROOFS_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: proofFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError.message);
      return NextResponse.json(
        {
          success: false,
          message:
            "We could not upload your payment proof. Please try again.",
        },
        { status: 500 }
      );
    }

    const { error: insertError } = await supabaseAdmin
      .from(REGISTRATIONS_TABLE)
      .insert({
        id: registrationId,
        full_name: data.full_name,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        city_country: data.city_country,
        player_role: data.player_role,
        batting_style: data.batting_style,
        bowling_style: data.bowling_style,
        payment_method: data.payment_method,
        utr_transaction_id: data.utr_transaction_id,
        payment_sender_name: data.payment_sender_name,
        payment_proof_path: storagePath,
        payment_status: "pending",
      });

    if (insertError) {
      console.error("Supabase insert error:", insertError.message);
      // Best-effort cleanup of the uploaded file if the DB insert failed.
      await supabaseAdmin.storage.from(PROOFS_BUCKET).remove([storagePath]);

      return NextResponse.json(
        {
          success: false,
          message:
            "We could not save your registration. Please try again in a moment.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration submitted successfully.",
        registrationId,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Unexpected error in /api/register:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}

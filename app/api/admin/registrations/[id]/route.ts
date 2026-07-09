import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, REGISTRATIONS_TABLE } from "@/lib/supabaseAdmin";
import { isAuthorizedAdmin } from "@/lib/adminAuth";
import { paymentStatusSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const bodyPassword =
    typeof body === "object" && body !== null && "password" in body
      ? String((body as Record<string, unknown>).password ?? "")
      : undefined;

  if (!isAuthorizedAdmin(request, bodyPassword)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const parsed = paymentStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "payment_status must be one of pending, verified, rejected.",
      },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from(REGISTRATIONS_TABLE)
    .update({
      payment_status: parsed.data.payment_status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Supabase update error:", error.message);
    return NextResponse.json(
      { success: false, message: "Could not update registration status." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

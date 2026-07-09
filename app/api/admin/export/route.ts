import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, REGISTRATIONS_TABLE } from "@/lib/supabaseAdmin";
import { isAuthorizedAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";

const CSV_COLUMNS: { key: string; header: string }[] = [
  { key: "full_name", header: "Full Name" },
  { key: "phone", header: "Phone" },
  { key: "whatsapp", header: "WhatsApp" },
  { key: "email", header: "Email" },
  { key: "city_country", header: "City / Country" },
  { key: "player_role", header: "Player Role" },
  { key: "batting_style", header: "Batting Style" },
  { key: "bowling_style", header: "Bowling Style" },
  { key: "payment_method", header: "Payment Method" },
  { key: "utr_transaction_id", header: "UTR / Transaction ID" },
  { key: "payment_sender_name", header: "Payment Sender Name" },
  { key: "payment_status", header: "Payment Status" },
  { key: "created_at", header: "Registered At" },
];

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const queryPassword = url.searchParams.get("password") || undefined;

  if (!isAuthorizedAdmin(request, queryPassword)) {
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
      { success: false, message: "Could not export registrations." },
      { status: 500 }
    );
  }

  const headerRow = CSV_COLUMNS.map((col) => csvEscape(col.header)).join(",");
  const rows = (registrations || []).map((registration) =>
    CSV_COLUMNS.map((col) =>
      csvEscape((registration as Record<string, unknown>)[col.key])
    ).join(",")
  );

  const csvContent = [headerRow, ...rows].join("\n");
  const fileName = `smpl-t20-registrations-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}

import "server-only";
import fs from "fs";
import path from "path";

/**
 * Zero-setup local data store: registrations are saved to a JSON file
 * and payment proofs to a local folder. This exists purely so the
 * project runs out of the box with `npm install && npm run dev` —
 * no Supabase account required.
 *
 * NOT for production: on serverless platforms (like Vercel) the
 * filesystem is ephemeral/read-only, so this data will not persist
 * across deploys or across serverless instances. For production,
 * configure real Supabase credentials (see README.md) and the app
 * automatically switches to Supabase — no code changes needed.
 */

export type LocalRegistration = {
  id: string;
  full_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  city_country: string;
  player_role: string;
  batting_style: string;
  bowling_style: string;
  payment_method: string;
  utr_transaction_id: string;
  payment_sender_name: string;
  payment_proof_path: string | null;
  payment_status: "pending" | "verified" | "rejected";
  created_at: string;
  updated_at: string;
};

const DATA_DIR = path.join(process.cwd(), "local-data");
const DB_FILE = path.join(DATA_DIR, "registrations.json");
const PROOFS_DIR = path.join(DATA_DIR, "proofs");

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PROOFS_DIR)) fs.mkdirSync(PROOFS_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "[]", "utf-8");
}

function readAll(): LocalRegistration[] {
  ensureDirs();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(rows: LocalRegistration[]) {
  ensureDirs();
  fs.writeFileSync(DB_FILE, JSON.stringify(rows, null, 2), "utf-8");
}

export function insertLocalRegistration(record: LocalRegistration) {
  const rows = readAll();
  rows.push(record);
  writeAll(rows);
}

export function listLocalRegistrations(): LocalRegistration[] {
  return readAll().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function updateLocalStatus(
  id: string,
  status: "pending" | "verified" | "rejected"
): boolean {
  const rows = readAll();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  rows[idx].payment_status = status;
  rows[idx].updated_at = new Date().toISOString();
  writeAll(rows);
  return true;
}

export function saveLocalProofFile(
  registrationId: string,
  fileName: string,
  buffer: Buffer
): string {
  ensureDirs();
  const dir = path.join(PROOFS_DIR, registrationId);
  fs.mkdirSync(dir, { recursive: true });
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = path.join(dir, safeName);
  fs.writeFileSync(filePath, buffer);
  // Stored as a relative path: "<registrationId>/<safeName>"
  return path.join(registrationId, safeName);
}

export function readLocalProofFile(relativePath: string): Buffer | null {
  // Prevent path traversal outside the proofs directory.
  const normalized = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PROOFS_DIR, normalized);
  if (!filePath.startsWith(PROOFS_DIR)) return null;
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath);
}

export function getContentTypeForPath(relativePath: string): string {
  const ext = relativePath.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

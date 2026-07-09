import "server-only";
import { NextRequest } from "next/server";

const ADMIN_HEADER = "x-admin-password";

/**
 * Verifies the admin password sent by the client against the
 * ADMIN_PASSWORD environment variable. The password is expected
 * either as a header ("x-admin-password") or in the JSON body
 * under the "password" key.
 */
export function isAuthorizedAdmin(request: NextRequest, bodyPassword?: string) {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    // Fail closed: if no password is configured on the server,
    // nobody can access the admin routes.
    return false;
  }

  const provided = request.headers.get(ADMIN_HEADER) || bodyPassword;

  if (!provided) return false;

  return timingSafeEqual(provided, expected);
}

// Basic constant-time string comparison to reduce timing attack surface.
function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export const ADMIN_PASSWORD_HEADER = ADMIN_HEADER;

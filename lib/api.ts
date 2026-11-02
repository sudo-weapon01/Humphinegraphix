import { NextResponse } from "next/server";
import { getStaffSession } from "./auth";
import type { StaffSession } from "./session";

/** Consistent JSON error body for route handlers. */
export function jsonError(message: string, status = 400, errors?: Record<string, string>) {
  return NextResponse.json({ ok: false, message, errors: errors ?? {} }, { status });
}

export function jsonOk<T extends object>(data: T, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

/**
 * Same-origin check for mutation endpoints. Combined with SameSite=Lax cookies
 * this keeps cross-site form posts from triggering authenticated writes.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser client (curl/tests) with a session cookie
  const host = request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * Auth guard for admin API routes. Returns either the session or a 401 response
 * that the route should return immediately.
 */
export async function guardAdminApi(
  request: Request,
): Promise<{ session: StaffSession } | { response: NextResponse }> {
  if (!isSameOrigin(request)) {
    return { response: jsonError("Cross-origin requests are not allowed.", 403) };
  }
  const session = await getStaffSession();
  if (!session) {
    return { response: jsonError("Sign in as studio staff to continue.", 401) };
  }
  return { session };
}

/** Reads a JSON body, tolerating empty or malformed input. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

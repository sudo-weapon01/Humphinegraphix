import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionSecret } from "./auth-config";
import { SESSION_COOKIE, verifySessionToken, type StaffSession } from "./session";

/** Reads and verifies the staff session cookie. Server components / routes only. */
export async function getStaffSession(): Promise<StaffSession | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value, getSessionSecret());
}

/**
 * Guard for admin server components. Middleware already blocks unauthenticated
 * navigation, but every admin route re-checks so a middleware misconfiguration
 * can never expose the editing UI or its data.
 */
export async function requireStaffSession(): Promise<StaffSession> {
  const session = await getStaffSession();
  if (!session) redirect("/admin/login");
  return session;
}

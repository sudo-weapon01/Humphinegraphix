import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Deterministic credentials for the auth tests.
process.env.ADMIN_USERNAME = "studio";
process.env.ADMIN_PASSWORD = "test-password";
process.env.ADMIN_SESSION_SECRET = "test-session-secret-at-least-16-chars";
process.env.SUPABASE_URL = "";
process.env.SUPABASE_SERVICE_ROLE_KEY = "";

afterEach(() => {
  if (typeof document !== "undefined") cleanup();
});

import { NextResponse } from "next/server";
import { isSameOrigin, jsonError, jsonOk, readJson } from "@/lib/api";
import { getPublishedBundle } from "@/lib/content/store";
import { flyerTypeOptions } from "@/lib/content/types";
import { saveQuoteRequest } from "@/lib/enquiries";
import { validateQuoteInput } from "@/lib/quote";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public quote request endpoint.
 * Validates server-side with the same rules the form uses, then stores the lead.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Cross-origin requests are not allowed.", 403);
  }

  const body = await readJson(request);
  if (!body) {
    return jsonError("We couldn't read that request. Please try again.", 400);
  }

  // Flyer types are validated against the published Services page content.
  let allowedTypes: string[] = [];
  try {
    const content = await getPublishedBundle();
    allowedTypes = flyerTypeOptions(content.services);
  } catch {
    return jsonError(
      "The quoting service is temporarily unavailable. Please email the studio directly.",
      503,
    );
  }

  const result = validateQuoteInput(body, allowedTypes);
  if (!result.ok) {
    // Honeypot hit: return a normal success so bots get no signal.
    if (result.errors.company) {
      return NextResponse.json({ ok: true, message: "Request received." });
    }
    return jsonError("Please check the highlighted fields and try again.", 422, result.errors);
  }

  try {
    await saveQuoteRequest(result.data);
  } catch (error) {
    console.error("[quote] failed to save request", error);
    return jsonError(
      "Something went wrong saving your request. Please try again, or email the studio directly.",
      503,
    );
  }

  return jsonOk({ message: "Request received." }, 201);
}

export async function GET() {
  return jsonError("Method not allowed.", 405);
}

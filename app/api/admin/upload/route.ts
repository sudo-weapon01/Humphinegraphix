import { guardAdminApi, jsonError, jsonOk } from "@/lib/api";
import { checkRateLimit, rateLimitMessage } from "@/lib/ratelimit";
import { uploadPortfolioImage, uploadValidationError } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Accepts one image for a portfolio item and returns its public URL. */
export async function POST(request: Request) {
  const guard = await guardAdminApi(request);
  if ("response" in guard) return guard.response;

  const limit = await checkRateLimit("upload", `staff:${guard.session.sub}`);
  if (!limit.allowed) {
    return jsonError(rateLimitMessage(limit.retryAfterSeconds), 429);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("That upload could not be read. Please try again.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonError("Choose an image file to upload.", 400, { file: "Choose an image file." });
  }

  const validationError = uploadValidationError(file);
  if (validationError) {
    return jsonError(validationError, 422, { file: validationError });
  }

  try {
    const result = await uploadPortfolioImage(file);
    return jsonOk({ url: result.url, storage: result.storage }, 201);
  } catch (error) {
    console.error("[admin/upload] failed", error);
    return jsonError("The image could not be stored. Please try again.", 500);
  }
}

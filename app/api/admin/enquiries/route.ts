import { guardAdminApi, jsonError, jsonOk, readJson } from "@/lib/api";
import { listQuoteRequests, quoteRequestsToCsv, setEnquiryStatus } from "@/lib/enquiries";
import { isEnquiryStatus } from "@/lib/quote";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** JSON list, or `?format=csv` for an export of every quote request. */
export async function GET(request: Request) {
  const guard = await guardAdminApi(request);
  if ("response" in guard) return guard.response;

  const url = new URL(request.url);
  if (url.searchParams.get("format") !== "csv") {
    try {
      return jsonOk({ enquiries: await listQuoteRequests(200) });
    } catch (error) {
      console.error("[admin/enquiries] list failed", error);
      return jsonError("Could not load the quote requests.", 500);
    }
  }

  try {
    const csv = await quoteRequestsToCsv(500);
    const date = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="humphinegraphix-enquiries-${date}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[admin/enquiries] csv failed", error);
    return jsonError("Could not build the export.", 500);
  }
}

/** Updates triage status: new | replied | archived. */
export async function PATCH(request: Request) {
  const guard = await guardAdminApi(request);
  if ("response" in guard) return guard.response;

  const body = (await readJson(request)) as { id?: unknown; status?: unknown } | null;
  if (!body || typeof body.id !== "string" || !body.id) {
    return jsonError("That request could not be identified.", 400);
  }
  if (!isEnquiryStatus(body.status)) {
    return jsonError("Unknown status.", 400);
  }

  try {
    const updated = await setEnquiryStatus(body.id, body.status);
    if (!updated) return jsonError("That request no longer exists.", 404);
    return jsonOk({ id: body.id, status: body.status });
  } catch (error) {
    console.error("[admin/enquiries] update failed", error);
    return jsonError("Could not update that request. Please try again.", 500);
  }
}

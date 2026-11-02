import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const runtime = "nodejs";

// 1200x630 is the size every major platform crops cleanly to.
const size = { width: 1200, height: 630 };

/**
 * Renders social cards at exactly 1200x630 with the page headline baked in.
 * Text is clamped and stripped of control characters so the query string cannot
 * be used to push the renderer around.
 */
function clean(value: string | null, max: number): string {
  if (!value) return "";
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = clean(searchParams.get("title"), 70) || SITE_NAME;
  const subtitle = clean(searchParams.get("subtitle"), 110) || SITE_TAGLINE;

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f3efe6",
          padding: "64px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Grid rails + poster shapes, matching the site's editorial layout. */}
        {[0.31, 0.62, 0.86].map((left) => (
          <div
            key={left}
            style={{
              position: "absolute",
              left: `${left * 100}%`,
              top: 0,
              height: "100%",
              width: "1px",
              background: "#d8d1c2",
              display: "flex",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            right: "-90px",
            top: "-110px",
            width: "420px",
            height: "420px",
            borderRadius: "9999px",
            border: "44px solid #ff3b00",
            opacity: 0.9,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "64px",
            top: "150px",
            width: "54px",
            height: "6px",
            background: "#131211",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "18px", position: "relative" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "#ff3b00",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "22px",
              fontWeight: 700,
            }}
          >
            HG
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: "#131211", fontSize: "30px", fontWeight: 700, letterSpacing: "-1.2px" }}>
              {SITE_NAME}
            </div>
            <div
              style={{
                color: "#5c574e",
                fontSize: "13px",
                letterSpacing: "4px",
                textTransform: "uppercase",
                marginTop: "6px",
              }}
            >
              Flyer design studio
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: "800px", position: "relative" }}>
          <div
            style={{
              color: "#131211",
              fontSize: title.length > 42 ? "62px" : "78px",
              fontWeight: 800,
              lineHeight: 0.98,
              letterSpacing: "-3px",
              display: "flex",
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: "#5c574e",
              fontSize: "26px",
              lineHeight: 1.35,
              marginTop: "22px",
              display: "flex",
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            borderTop: "1px solid #d3ccbc",
            paddingTop: "20px",
          }}
        >
          <div
            style={{
              color: "#131211",
              fontSize: "13px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Print-ready · Social crops · Quote on request
          </div>
          {/* Plain shapes only: any glyph outside the bundled font makes satori
              fetch a fallback face over the network at request time. */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ width: "16px", height: "16px", background: "#ff3b00", display: "flex" }} />
            <div style={{ width: "16px", height: "16px", background: "#131211", display: "flex" }} />
          </div>
        </div>
      </div>
    ),
    size,
  );

  // Health check used by the deployment smoke test: renders the image fully and
  // reports the result as JSON, so a broken card is visible without an image
  // viewer. Public pages never send this parameter.
  if (searchParams.get("format") === "json") {
    try {
      const bytes = await image.arrayBuffer();
      return Response.json({ ok: true, width: size.width, height: size.height, bytes: bytes.byteLength });
    } catch (error) {
      console.error("[og] render failed", error);
      return Response.json(
        { ok: false, message: error instanceof Error ? error.message : "render failed" },
        { status: 500 },
      );
    }
  }

  return image;
}

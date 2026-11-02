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

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#10233f",
          padding: "72px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-120px",
            top: "-120px",
            width: "460px",
            height: "460px",
            borderRadius: "9999px",
            background: "#b8481a",
            opacity: 0.9,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "120px",
            bottom: "-160px",
            width: "520px",
            height: "520px",
            background: "#1f8a8a",
            opacity: 0.85,
            transform: "rotate(14deg)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "#f2c14e",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#10233f",
              fontSize: "34px",
              fontWeight: 700,
            }}
          >
            H
          </div>
          <div style={{ color: "#f7f3ea", fontSize: "30px", fontWeight: 700, letterSpacing: "-0.5px" }}>
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: "820px" }}>
          <div
            style={{
              color: "#f7f3ea",
              fontSize: title.length > 42 ? "66px" : "82px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-1.5px",
              display: "flex",
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: "#c8d3e3",
              fontSize: "30px",
              lineHeight: 1.35,
              marginTop: "24px",
              display: "flex",
            }}
          >
            {subtitle}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "64px", height: "6px", background: "#f2c14e", display: "flex" }} />
          <div style={{ color: "#8ea3bf", fontSize: "24px", display: "flex" }}>
            Flyer design studio · Print-ready · Request a quote
          </div>
        </div>
      </div>
    ),
    size,
  );
}

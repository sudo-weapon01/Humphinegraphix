// @vitest-environment jsdom
import axe from "axe-core";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

/**
 * Automated accessibility checks (axe-core) over the pages and forms that carry
 * the most interactive risk: the home page, the portfolio gallery, the quote
 * form, and the FAQ accordion.
 *
 * These catch structural problems (missing labels, bad landmarks, invalid ARIA).
 * Colour contrast is checked by eye and by the hand-picked palette, because axe
 * cannot compute it without a real layout engine.
 */
vi.mock("@/lib/content/public", async () => {
  const { defaultBundle } = await import("@/lib/content/defaults");
  const bundle = structuredClone(defaultBundle) as Record<string, any>;
  return { getSiteContent: async () => bundle, CONTENT_TAG: "published-content" };
});

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt = "", src }: { alt?: string; src?: string }) => (
    <img alt={alt} src={typeof src === "string" ? src : "mocked-image"} />
  ),
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const { default: HomePage } = await import("@/app/(site)/page");
const { default: ServicesPage } = await import("@/app/(site)/services/page");
const { default: PrivacyPage } = await import("@/app/(site)/privacy/page");
const { default: PortfolioPage } = await import("@/app/(site)/portfolio/page");
const { QuoteForm } = await import("@/components/forms/QuoteForm");
const { defaultPages, defaultBundle } = await import("@/lib/content/defaults");

const axeOptions = {
  rules: {
    // Needs layout (canvas) to measure real rendered colours.
    "color-contrast": { enabled: false },
    // The test renders a fragment, not a full document with <html lang>.
    region: { enabled: false },
  },
} as const;

async function expectNoViolations(node: HTMLElement) {
  const results = await axe.run(node, axeOptions);
  const summary = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    nodes: violation.nodes.map((entry) => entry.target.join(" ")),
  }));
  expect(summary).toEqual([]);
}

describe("accessibility", () => {
  it("home page has no axe violations", async () => {
    const { container } = render(await HomePage());
    await expectNoViolations(container);
  });

  it("services page has no axe violations", async () => {
    const { container } = render(await ServicesPage());
    await expectNoViolations(container);
  });

  it("portfolio page has no axe violations", async () => {
    const { container } = render(await PortfolioPage());
    await expectNoViolations(container);
  });

  it("privacy page has no axe violations", async () => {
    const { container } = render(await PrivacyPage());
    await expectNoViolations(container);
  });

  it("quote form has no axe violations", async () => {
    const { container } = render(
      <QuoteForm
        flyerTypes={defaultBundle.services.flatMap((service) => service.flyerTypes)}
        copy={defaultPages.contact}
      />,
    );
    await expectNoViolations(container);
  });

  it("quote form with validation errors still has no axe violations", async () => {
    const { container, getByRole } = render(
      <QuoteForm flyerTypes={["Event flyer"]} copy={defaultPages.contact} />,
    );

    (getByRole("button", { name: /send quote request/i }) as HTMLButtonElement).click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    await expectNoViolations(container);
  });
});

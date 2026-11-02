// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Public page rendering tests.
 *
 * The content getter is mocked with a bundle that stands in for whatever staff
 * have published, so these tests also prove the pages are content-driven.
 */
const state = vi.hoisted(() => ({
  bundle: null as null | Record<string, any>,
  initialPortfolio: [] as Record<string, any>[],
}));

vi.mock("@/lib/content/public", async () => {
  const { defaultBundle } = await import("@/lib/content/defaults");
  const bundle = structuredClone(defaultBundle) as Record<string, any>;
  bundle.pages.home.heroTitle = "Flyers that earn a second look —";
  bundle.pages.home.heroHighlight = "published headline for tests";
  bundle.services[0].name = "Published Service Name";
  bundle.portfolio[0].title = "Published Flyer Title";
  state.bundle = bundle;
  state.initialPortfolio = structuredClone(bundle.portfolio);

  return {
    getSiteContent: async () => state.bundle,
    CONTENT_TAG: "published-content",
  };
});

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt = "", src }: { alt?: string; src?: string }) => (
    <img alt={alt} src={typeof src === "string" ? src : "mocked-image"} />
  ),
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  } & Record<string, unknown>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const { default: HomePage } = await import("@/app/(site)/page");
const { default: ServicesPage } = await import("@/app/(site)/services/page");
const { default: PortfolioPage } = await import("@/app/(site)/portfolio/page");
const { default: AboutPage } = await import("@/app/(site)/about/page");
const { default: ContactPage } = await import("@/app/(site)/contact/page");

beforeEach(() => {
  // Reset per-test mutations of the mocked published bundle.
  state.bundle!.pages.home.heroTitle = "Flyers that earn a second look —";
  state.bundle!.pages.home.heroHighlight = "published headline for tests";
  state.bundle!.portfolio = structuredClone(state.initialPortfolio);
});

describe("home page", () => {
  it("renders the published hero copy and the brand name", async () => {
    render(await HomePage());

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Flyers that earn a second look —",
    );
    expect(screen.getByText("published headline for tests")).toBeInTheDocument();
    expect(screen.getAllByText(/Humphinegraphix/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /request a quote/i })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("renders featured work from the published portfolio", async () => {
    render(await HomePage());
    expect(screen.getByRole("heading", { name: "Published Flyer Title" })).toBeInTheDocument();
  });

  it("shows the audience section for businesses, organizers, and individuals", async () => {
    render(await HomePage());
    expect(screen.getByRole("heading", { name: "Small businesses" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Event organizers" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Individuals" })).toBeInTheDocument();
  });
});

describe("services page", () => {
  it("renders every published service with its flyer types", async () => {
    render(await ServicesPage());

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      state.bundle!.pages.services.title,
    );
    expect(screen.getByRole("heading", { name: "Published Service Name" })).toBeInTheDocument();

    const service = screen.getByRole("heading", { name: "Published Service Name" }).closest("li");
    expect(service).not.toBeNull();
    expect(
      within(service as HTMLElement).getByText(state.bundle!.services[0].flyerTypes[0]),
    ).toBeInTheDocument();
  });

  it("does not display pricing", async () => {
    const { container } = render(await ServicesPage());
    expect(container.textContent).not.toMatch(/GHS|₵|\$\s?\d|price|pricing/i);
  });
});

describe("portfolio page", () => {
  it("renders published portfolio items", async () => {
    render(await PortfolioPage());
    expect(screen.getByRole("heading", { name: "Published Flyer Title" })).toBeInTheDocument();
    expect(screen.getAllByRole("img").length).toBeGreaterThan(0);
  });

  it("shows the published empty state when there is no work", async () => {
    state.bundle!.portfolio = [];
    render(await PortfolioPage());
    expect(screen.getByText(state.bundle!.pages.portfolio.emptyState)).toBeInTheDocument();
  });
});

describe("about page", () => {
  it("renders the studio story and values", async () => {
    render(await AboutPage());
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      state.bundle!.pages.about.title,
    );
    for (const paragraph of state.bundle!.pages.about.storyParagraphs) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
    expect(
      screen.getByRole("heading", { name: state.bundle!.pages.about.values[0].title }),
    ).toBeInTheDocument();
  });
});

describe("contact page", () => {
  it("renders the quote form, studio details, and flyer types from Services", async () => {
    render(await ContactPage());

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      state.bundle!.pages.contact.title,
    );
    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Message|Tell us about the flyer/)).toBeInTheDocument();

    // Contact details come from published copy.
    expect(
      screen.getByRole("link", { name: state.bundle!.pages.contact.email }),
    ).toBeInTheDocument();

    // The dropdown is populated from the published services.
    const flyerTypeSelect = screen.getByLabelText(/^Flyer type/);
    for (const service of state.bundle!.services as { flyerTypes: string[] }[]) {
      for (const type of service.flyerTypes) {
        expect(within(flyerTypeSelect).getByRole("option", { name: type })).toBeInTheDocument();
      }
    }
  });
});

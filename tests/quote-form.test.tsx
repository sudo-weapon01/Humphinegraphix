// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { defaultPages } from "@/lib/content/defaults";
import { BUDGET_RANGES } from "@/lib/quote";

const flyerTypes = ["Business promotion", "Live music or concert"];
const copy = defaultPages.contact;

function renderForm() {
  return render(<QuoteForm flyerTypes={flyerTypes} copy={copy} />);
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Name/), "Ama Mensah");
  await user.type(screen.getByLabelText(/^Email/), "ama@example.com");
  await user.selectOptions(screen.getByLabelText(/^Flyer type/), "Live music or concert");
  await user.selectOptions(screen.getByLabelText(/^Budget range/), BUDGET_RANGES[2]);
  await user.type(
    screen.getByLabelText(/^Tell us about the flyer/),
    "A flyer for a live music night at the community centre.",
  );
}

describe("QuoteForm", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders every field with an accessible label", () => {
    renderForm();
    for (const label of [
      /^Name/,
      /^Email/,
      /^Phone/,
      /^Flyer type/,
      /^Event date/,
      /^Deadline/,
      /^Budget range/,
      /^Tell us about the flyer/,
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it("shows inline errors and does not submit when required fields are empty", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /send quote request/i }));

    expect(await screen.findByText("Please tell us your name.")).toBeInTheDocument();
    expect(screen.getByText("Please enter your email address.")).toBeInTheDocument();
    expect(screen.getByText("Please choose the type of flyer you need.")).toBeInTheDocument();
    expect(screen.getByText("Please choose a budget range.")).toBeInTheDocument();
    expect(screen.getByText("Please describe the flyer you need.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    // Errors are associated with their fields for assistive technology.
    expect(screen.getByLabelText(/^Name/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/^Name/)).toHaveAccessibleDescription(/please tell us your name/i);
  });

  it("validates the email format before submitting", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/^Email/), "not-an-email");
    await user.click(screen.getByRole("button", { name: /send quote request/i }));

    expect(await screen.findByText(/Enter an email address like/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits valid input and shows the success confirmation", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    renderForm();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send quote request/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/quote");
    expect(init.method).toBe("POST");
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({
      name: "Ama Mensah",
      email: "ama@example.com",
      flyerType: "Live music or concert",
      budgetRange: BUDGET_RANGES[2],
    });

    expect(await screen.findByText(copy.successTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.successBody)).toBeInTheDocument();
  });

  it("shows server-side field errors returned by the API", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        ok: false,
        message: "Please check the highlighted fields and try again.",
        errors: { email: "That email domain looks wrong." },
      }),
    });
    renderForm();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send quote request/i }));

    expect(await screen.findByText("That email domain looks wrong.")).toBeInTheDocument();
    expect(
      screen.getByText("Please check the highlighted fields and try again."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send quote request/i })).toBeEnabled();
  });

  it("handles a failed submission gracefully", async () => {
    const user = userEvent.setup();
    fetchMock.mockRejectedValue(new Error("network down"));
    renderForm();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send quote request/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't reach the studio/i);
    // The form stays usable so the visitor can retry.
    expect(screen.getByLabelText(/^Name/)).toHaveValue("Ama Mensah");
  });

  it("disables the submit button while the request is in flight", async () => {
    const user = userEvent.setup();
    let resolveFetch: (value: unknown) => void = () => {};
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );
    renderForm();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send quote request/i }));

    const pendingButton = await screen.findByRole("button", { name: /sending/i });
    expect(pendingButton).toBeDisabled();

    resolveFetch({ ok: true, json: async () => ({ ok: true }) });
    expect(await screen.findByText(copy.successTitle)).toBeInTheDocument();
  });
});

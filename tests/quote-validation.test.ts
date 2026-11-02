import { describe, expect, it } from "vitest";
import {
  BUDGET_RANGES,
  UNSURE_FLYER_TYPE,
  validateQuoteInput,
  type QuoteInput,
} from "@/lib/quote";

const flyerTypes = ["Event flyer", "Business flyer"];

const validInput: QuoteInput = {
  name: "Ama Mensah",
  email: "ama@example.com",
  phone: "+233 20 123 4567",
  flyerType: "Event flyer",
  eventDate: "2030-05-12",
  budgetRange: BUDGET_RANGES[1],
  deadline: "2030-05-01",
  message: "We need a flyer for a live music night at the community centre.",
};

function validate(patch: Partial<QuoteInput>) {
  return validateQuoteInput({ ...validInput, ...patch }, flyerTypes);
}

describe("validateQuoteInput", () => {
  it("accepts a complete request and normalises optional fields", () => {
    const result = validateQuoteInput({ ...validInput, phone: "", eventDate: "", deadline: "" }, flyerTypes);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.name).toBe("Ama Mensah");
    expect(result.data.phone).toBeNull();
    expect(result.data.eventDate).toBeNull();
    expect(result.data.deadline).toBeNull();
    expect(result.data.id).toMatch(/^q_/);
    expect(result.data.submittedAt).toBeTruthy();
  });

  it("trims whitespace and collapses runs of spaces in names", () => {
    const result = validate({ name: "  Ama    Mensah  " });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.name).toBe("Ama Mensah");
  });

  it("requires name, email, flyer type, budget, and message", () => {
    const result = validateQuoteInput({}, flyerTypes);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.errors).sort()).toEqual(
      ["budgetRange", "email", "flyerType", "message", "name"].sort(),
    );
  });

  it("rejects malformed email addresses", () => {
    for (const email of ["not-an-email", "a@b", "a b@example.com", "@example.com"]) {
      const result = validate({ email });
      expect(result.ok, email).toBe(false);
      if (!result.ok) expect(result.errors.email).toBeTruthy();
    }
  });

  it("accepts a range of real-world email formats", () => {
    for (const email of ["ama@example.com", "ama.mensah+flyers@studio.co.uk"]) {
      expect(validate({ email }).ok).toBe(true);
    }
  });

  it("validates the phone number only when one is provided", () => {
    for (const phone of ["12345", "phone", "++233 20 123 4567"]) {
      const result = validate({ phone });
      expect(result.ok, phone).toBe(false);
      if (!result.ok) expect(result.errors.phone).toBeTruthy();
    }
    expect(validate({ phone: "" }).ok).toBe(true);
    expect(validate({ phone: "+233 20 123 4567" }).ok).toBe(true);
  });

  it("only accepts flyer types offered on the Services page", () => {
    const result = validate({ flyerType: "Hovercraft flyer" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.flyerType).toContain("listed flyer types");

    expect(validate({ flyerType: UNSURE_FLYER_TYPE }).ok).toBe(true);
  });

  it("only accepts budget ranges offered in the dropdown", () => {
    const result = validate({ budgetRange: "One million" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.budgetRange).toBeTruthy();
  });

  it("rejects dates in the past and impossible dates", () => {
    const past = validate({ eventDate: "2020-01-01" });
    expect(past.ok).toBe(false);
    if (!past.ok) expect(past.errors.eventDate).toContain("past");

    const impossible = validate({ eventDate: "2030-02-31" });
    expect(impossible.ok).toBe(false);
    if (!impossible.ok) expect(impossible.errors.eventDate).toBeTruthy();
  });

  it("rejects a deadline that falls after the event", () => {
    const result = validate({ eventDate: "2030-05-12", deadline: "2030-06-01" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.deadline).toBeTruthy();
  });

  it("requires a message with a little substance", () => {
    const result = validate({ message: "hi" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.message).toContain("at least 10");
  });
});

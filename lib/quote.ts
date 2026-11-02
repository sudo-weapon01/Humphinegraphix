import type { Result } from "./validation";
import {
  collapseWhitespace,
  isValidEmail,
  isValidIsoDate,
  isValidPhone,
  isRecord,
  todayIso,
} from "./validation";

/**
 * Quote request form: options, shared validation, and persistence helpers.
 *
 * The public site is a lead-generation site only — there is no pricing table,
 * cart, checkout, or online payment anywhere in this project. Budget is a range
 * the visitor picks purely so the studio can respond with a sensible quote.
 */

// PLACEHOLDER_BUDGET_RANGES — confirm the currency and bands with the studio.
export const BUDGET_CURRENCY = "GHS";
export const BUDGET_RANGES = [
  `Under ${BUDGET_CURRENCY} 300`,
  `${BUDGET_CURRENCY} 300 – 600`,
  `${BUDGET_CURRENCY} 600 – 1,000`,
  `${BUDGET_CURRENCY} 1,000 – 2,000`,
  `${BUDGET_CURRENCY} 2,000+`,
  "Prefer to discuss",
] as const;

/** Appended to the flyer types pulled from the Services page. */
export const UNSURE_FLYER_TYPE = "Not sure yet — advise me";

export type QuoteInput = {
  name: string;
  email: string;
  phone: string;
  flyerType: string;
  eventDate: string;
  budgetRange: string;
  deadline: string;
  message: string;
  /** Honeypot: must stay empty. Bots fill it in. */
  company?: string;
};

export type QuoteRequest = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  flyerType: string;
  eventDate: string | null;
  budgetRange: string;
  deadline: string | null;
  message: string;
  submittedAt: string;
  /** Triage state, managed in the admin area. */
  status: EnquiryStatus;
};

export const ENQUIRY_STATUSES = ["new", "replied", "archived"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export function isEnquiryStatus(value: unknown): value is EnquiryStatus {
  return typeof value === "string" && (ENQUIRY_STATUSES as readonly string[]).includes(value);
}

export const EMPTY_QUOTE: QuoteInput = {
  name: "",
  email: "",
  phone: "",
  flyerType: "",
  eventDate: "",
  budgetRange: "",
  deadline: "",
  message: "",
};

const EMAIL_PATTERN_HINT = "Enter an email address like name@example.com.";

export function validateQuoteInput(
  input: unknown,
  flyerTypes: string[],
  now: Date = new Date(),
): Result<QuoteRequest> {
  const errors: Record<string, string> = {};
  const raw = isRecord(input) ? input : {};
  const text = (key: keyof QuoteInput): string =>
    typeof raw[key] === "string" ? (raw[key] as string).trim() : "";

  // Honeypot — silently rejected by the route as a success-looking no-op.
  if (text("company").length > 0) {
    errors.company = "Spam detected.";
  }

  const name = collapseWhitespace(text("name"));
  if (!name) errors.name = "Please tell us your name.";
  else if (name.length < 2) errors.name = "Please enter at least 2 characters.";
  else if (name.length > 120) errors.name = "Please keep your name under 120 characters.";

  const email = text("email");
  if (!email) errors.email = "Please enter your email address.";
  else if (!isValidEmail(email)) errors.email = EMAIL_PATTERN_HINT;

  const phone = collapseWhitespace(text("phone"));
  if (phone && !isValidPhone(phone)) {
    errors.phone = "Enter a phone number using digits, spaces, dashes, or a leading +.";
  }

  const flyerType = text("flyerType");
  const allowedFlyerTypes = [...flyerTypes, UNSURE_FLYER_TYPE];
  if (!flyerType) errors.flyerType = "Please choose the type of flyer you need.";
  else if (!allowedFlyerTypes.includes(flyerType)) {
    errors.flyerType = "Please choose one of the listed flyer types.";
  }

  const budgetRange = text("budgetRange");
  if (!budgetRange) errors.budgetRange = "Please choose a budget range.";
  else if (!(BUDGET_RANGES as readonly string[]).includes(budgetRange)) {
    errors.budgetRange = "Please choose one of the listed budget ranges.";
  }

  const today = todayIso();
  const eventDate = text("eventDate");
  if (eventDate) {
    if (!isValidIsoDate(eventDate)) errors.eventDate = "Enter a valid date.";
    else if (eventDate < today) errors.eventDate = "The event date cannot be in the past.";
  }

  const deadline = text("deadline");
  if (deadline) {
    if (!isValidIsoDate(deadline)) errors.deadline = "Enter a valid date.";
    else if (deadline < today) errors.deadline = "The deadline cannot be in the past.";
  }
  if (!errors.deadline && eventDate && deadline && !errors.eventDate && deadline > eventDate) {
    errors.deadline = "Your deadline should be on or before the event date.";
  }

  const message = text("message");
  if (!message) errors.message = "Please describe the flyer you need.";
  else if (message.length < 10) errors.message = "A sentence or two helps — at least 10 characters.";
  else if (message.length > 4000) errors.message = "Please keep your message under 4,000 characters.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      id: `q_${now.getTime().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      phone: phone || null,
      flyerType,
      eventDate: eventDate || null,
      budgetRange,
      deadline: deadline || null,
      message,
      submittedAt: now.toISOString(),
      status: "new",
    },
  };
}

// lib/estimate.ts
// The free-estimate request form: its options, validation, and the
// notification email it produces. Pure functions only, so the same
// validation runs in the browser (instant feedback) and on the server (the
// check that actually counts), and both are unit-testable without React or
// the network.
//
// The questions and options mirror the GoHighLevel form this replaced
// (form YGc0izXgK5e9BeLVlDvU), so the crew sees the same information.

export const SERVICE_OPTIONS = [
  "Tree Removal",
  "Tree Trimming",
  "Landscape Design",
  "Lawn Service",
  "24/7 Emergency Service",
  "Fencing",
  "Other",
] as const;

export const TIME_OPTIONS = ["8 am", "10 am", "1 pm", "3 pm", "5 pm or later"] as const;

export const STORM_OPTIONS = ["Yes", "No"] as const;

export type EstimateField =
  | "services"
  | "storm"
  | "date"
  | "times"
  | "address"
  | "city"
  | "phone";

export type EstimateRequest = {
  services: string[];
  storm: "Yes" | "No";
  /** "YYYY-MM-DD", or "" when the visitor didn't pick a day. */
  date: string;
  times: string[];
  address: string;
  city: string;
  phone: string;
  smsConsent: boolean;
  /** Path of the page the form was submitted from, e.g. "/tree-removal". */
  page: string;
};

export type FieldErrors = Partial<Record<EstimateField, string>>;

/** What the server action hands back to the form after each submit. */
export type EstimateFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "invalid"; errors: FieldErrors }
  | { status: "failed" };

export const INITIAL_ESTIMATE_STATE: EstimateFormState = { status: "idle" };

/** Hidden field real visitors never fill; bots that fill every input do. */
export const HONEYPOT_FIELD = "website";
/** Hidden field holding when the form was rendered (ms since epoch). */
export const STARTED_AT_FIELD = "startedAt";
/** Submissions faster than this after render are treated as bots. */
export const MIN_FILL_MS = 3000;

export type ParseResult =
  | { ok: true; data: EstimateRequest }
  | { ok: false; errors: FieldErrors };

const MAX_TEXT = 200;

function text(formData: FormData, name: string, max = MAX_TEXT): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Only keeps values that are real options, so the email can't be stuffed. */
function picks(formData: FormData, name: string, allowed: readonly string[]): string[] {
  const chosen = new Set(formData.getAll(name).filter((v): v is string => typeof v === "string"));
  return allowed.filter((option) => chosen.has(option));
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function parseEstimateForm(formData: FormData): ParseResult {
  const services = picks(formData, "services", SERVICE_OPTIONS);
  const stormRaw = text(formData, "storm");
  const date = text(formData, "date", 10);
  const times = picks(formData, "times", TIME_OPTIONS);
  const address = text(formData, "address");
  const city = text(formData, "city", 100);
  const phone = text(formData, "phone", 30);
  const digits = phoneDigits(phone);

  const errors: FieldErrors = {};
  if (services.length === 0) errors.services = "Please choose at least one service.";
  if (stormRaw !== "Yes" && stormRaw !== "No") errors.storm = "Please let us know if this is storm-related.";
  if (date && !isRealDate(date)) errors.date = "Please pick a valid date.";
  if (times.length === 0) errors.times = "Please choose a time that works for you.";
  if (!address) errors.address = "Please enter the property address.";
  if (!city) errors.city = "Please enter the city.";
  if (digits.length < 10 || digits.length > 11 || (digits.length === 11 && !digits.startsWith("1"))) {
    errors.phone = "Please enter a 10-digit phone number.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      services,
      storm: stormRaw as "Yes" | "No",
      date,
      times,
      address,
      city,
      phone,
      smsConsent: formData.get("smsConsent") === "yes",
      page: text(formData, "page", 300),
    },
  };
}

/** "(470) 403-0215" for a 10-digit US number; the raw input otherwise. */
export function formatPhone(phone: string): string {
  const digits = phoneDigits(phone);
  const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (ten.length !== 10) return phone;
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`;
}

function formatPreferredDate(isoDate: string): string {
  if (!isoDate) return "No preference";
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type EstimateEmail = { subject: string; text: string; html: string };

export function buildEstimateEmail(request: EstimateRequest, submittedAt: Date): EstimateEmail {
  const phone = formatPhone(request.phone);
  const telHref = `tel:+1${phoneDigits(phone).slice(-10)}`;
  const urgent = request.storm === "Yes" || request.services.includes("24/7 Emergency Service");
  const when = submittedAt.toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/New_York",
  });

  const rows: Array<[string, string]> = [
    ["Service(s)", request.services.join(", ")],
    ["Storm-related", request.storm],
    ["Preferred day", formatPreferredDate(request.date)],
    ["Preferred time", request.times.join(", ")],
    ["Address", request.address],
    ["City", request.city],
    ["Phone", phone],
    ["OK to text", request.smsConsent ? "Yes" : "No"],
    ["Sent from page", request.page || "—"],
    ["Submitted", `${when} (Eastern)`],
  ];

  const subject = `${urgent ? "[STORM/EMERGENCY] " : ""}New estimate request — ${request.city} — ${request.services.join(", ")}`;

  const text = [
    "New free-estimate request from mmptreeservice.com",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `Call back: ${phone}`,
  ].join("\n");

  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #E4E7DB;color:#4A4E42;white-space:nowrap;vertical-align:top"><strong>${escapeHtml(label)}</strong></td>` +
        `<td style="padding:8px 12px;border-bottom:1px solid #E4E7DB;color:#16180F">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const html =
    `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto">` +
    `<h2 style="color:#0F5C24;margin:0 0 4px">New free-estimate request</h2>` +
    `<p style="color:#4A4E42;margin:0 0 16px">Submitted on mmptreeservice.com</p>` +
    (urgent
      ? `<p style="background:#FDEBDD;color:#B4510A;padding:10px 12px;border-radius:6px;margin:0 0 16px"><strong>Storm-related or emergency job — call back first.</strong></p>`
      : "") +
    `<table style="border-collapse:collapse;width:100%;font-size:15px">${htmlRows}</table>` +
    `<p style="margin:20px 0 0"><a href="${telHref}" style="display:inline-block;background:#F2791D;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold">Call ${escapeHtml(phone)}</a></p>` +
    `</div>`;

  return { subject, text, html };
}

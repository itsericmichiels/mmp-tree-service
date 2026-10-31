"use server";
// lib/estimate-actions.ts
// Server action behind the free-estimate form: validates the request and
// emails it to the office through Resend. Nothing is stored — the email is
// the record — so if Resend fails the visitor is told to call instead,
// rather than being shown a "thanks" for a lead nobody received.
//
// Env:
//   RESEND_API_KEY       required — Resend API key
//   ESTIMATE_TO_EMAIL    optional — comma-separated recipients (default:
//                        itsericmichiels@gmail.com and mmptreeservicellc@gmail.com)
//   ESTIMATE_FROM_EMAIL  optional — sender; its domain must be verified in
//                        Resend (default estimates@mmptreeservice.com)
import {
  HONEYPOT_FIELD,
  MIN_FILL_MS,
  STARTED_AT_FIELD,
  buildEstimateEmail,
  parseEstimateForm,
  type EstimateFormState,
} from "@/lib/estimate";
import { sendEmail } from "@/lib/resend";

const DEFAULT_TO = ["itsericmichiels@gmail.com", "mmptreeservicellc@gmail.com"];
const DEFAULT_FROM = "MMP Tree Service Website <estimates@mmptreeservice.com>";

function recipients(): string[] {
  const list = (process.env.ESTIMATE_TO_EMAIL ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  return list.length > 0 ? list : DEFAULT_TO;
}

function looksLikeBot(formData: FormData, now: number): boolean {
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim() !== "") return true;

  const startedAt = Number(formData.get(STARTED_AT_FIELD));
  // Missing/garbled timestamp (e.g. JavaScript disabled) is not held against
  // the visitor; only an impossibly fast fill is.
  return Number.isFinite(startedAt) && startedAt > 0 && now - startedAt < MIN_FILL_MS;
}

export async function submitEstimateAction(
  _previous: EstimateFormState,
  formData: FormData
): Promise<EstimateFormState> {
  const now = Date.now();

  // Bots get the same "success" a person would, so they learn nothing.
  if (looksLikeBot(formData, now)) return { status: "success" };

  const parsed = parseEstimateForm(formData);
  if (!parsed.ok) return { status: "invalid", errors: parsed.errors };

  const email = buildEstimateEmail(parsed.data, new Date(now));
  const result = await sendEmail({
    from: process.env.ESTIMATE_FROM_EMAIL?.trim() || DEFAULT_FROM,
    to: recipients(),
    ...email,
  });

  if (!result.ok) {
    console.error(`[estimate] email not sent: ${result.error}`);
    return { status: "failed" };
  }
  return { status: "success" };
}

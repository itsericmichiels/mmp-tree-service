// lib/resend.ts
// Minimal Resend client: one POST to https://api.resend.com/emails. Calling
// the REST API directly keeps the site free of an extra SDK dependency for
// what is a single request.
//
// Server-only: it reads RESEND_API_KEY, which must never reach the browser.
// Import it only from server code (lib/estimate-actions.ts is "use server").

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type OutgoingEmail = {
  from: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

export type SendResult = { ok: true; id: string } | { ok: false; error: string };

export async function sendEmail(email: OutgoingEmail): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY is not set" };

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: email.from,
        to: email.to,
        subject: email.subject,
        text: email.text,
        html: email.html,
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const body = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!response.ok || !body.id) {
      return { ok: false, error: `Resend ${response.status}: ${body.message ?? "unknown error"}` };
    }
    return { ok: true, id: body.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

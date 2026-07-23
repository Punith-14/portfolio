import "server-only"

import { siteConfig } from "@/lib/site-config"

/**
 * Email delivery via Resend's REST API.
 *
 * Deliberately uses plain fetch rather than the `resend` npm package — one less
 * dependency, and the API is a single POST.
 *
 * Required env var:
 *   RESEND_API_KEY   from https://resend.com/api-keys
 *
 * Optional:
 *   CONTACT_FROM_EMAIL  defaults to Resend's shared onboarding sender, which
 *                       works immediately without verifying a domain
 *   CONTACT_TO_EMAIL    defaults to siteConfig.email
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails"

/** Resend lets any account send from this without domain verification. */
const DEFAULT_FROM = "Portfolio <onboarding@resend.dev>"

export interface ContactMessage {
  name: string
  email: string
  subject: string
  message: string
}

export type SendResult =
  | { ok: true; skipped?: boolean }
  | { ok: false; error: string }

/** Escape user input before it goes anywhere near an HTML template. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function buildHtml({ name, email, subject, message }: ContactMessage) {
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>")

  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f4f5;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;">
    <table role="presentation" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e4e4e7;border-collapse:separate;">
      <tr>
        <td style="padding:24px 28px;border-bottom:1px solid #e4e4e7;">
          <p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#71717a;">
            New portfolio message
          </p>
          <h1 style="margin:8px 0 0;font-size:18px;color:#18181b;">
            ${escapeHtml(subject)}
          </h1>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 28px;">
          <p style="margin:0 0 4px;font-size:13px;color:#71717a;">From</p>
          <p style="margin:0 0 20px;font-size:15px;color:#18181b;">
            ${escapeHtml(name)} &lt;<a href="mailto:${escapeHtml(email)}" style="color:#b7196f;text-decoration:none;">${escapeHtml(email)}</a>&gt;
          </p>

          <p style="margin:0 0 4px;font-size:13px;color:#71717a;">Message</p>
          <div style="font-size:15px;line-height:1.65;color:#27272a;">
            ${safeMessage}
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 28px;border-top:1px solid #e4e4e7;">
          <a href="mailto:${escapeHtml(email)}?subject=Re:%20${encodeURIComponent(subject)}"
             style="display:inline-block;background:#18181b;color:#ffffff;font-size:14px;text-decoration:none;padding:10px 20px;border-radius:999px;">
            Reply to ${escapeHtml(name)}
          </a>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function buildText({ name, email, subject, message }: ContactMessage) {
  return [
    `New portfolio message: ${subject}`,
    "",
    `From: ${name} <${email}>`,
    "",
    message,
  ].join("\n")
}

/**
 * Send a contact message. When RESEND_API_KEY isn't set, logs and reports
 * `skipped` rather than failing — local development shouldn't require a key.
 */
export async function sendContactEmail(
  payload: ContactMessage
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.log(
      "[contact] RESEND_API_KEY not set — message logged instead of emailed:",
      { from: `${payload.name} <${payload.email}>`, subject: payload.subject }
    )
    return { ok: true, skipped: true }
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM,
        to: [process.env.CONTACT_TO_EMAIL || siteConfig.email],
        // So hitting Reply in your mail client goes to the sender, not to you.
        reply_to: payload.email,
        subject: `[Portfolio] ${payload.subject}`,
        html: buildHtml(payload),
        text: buildText(payload),
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => "")
      console.error(
        `\n[contact] ✕ Resend rejected the send (HTTP ${res.status})\n` +
          `${detail}\n` +
          (res.status === 403
            ? "  Hint: without a verified domain, onboarding@resend.dev can only\n" +
              "  send to the email you signed up to Resend with. Either use that\n" +
              "  address as CONTACT_TO_EMAIL, or verify your own domain.\n"
            : res.status === 401
              ? "  Hint: RESEND_API_KEY is missing or wrong. Restart the dev server\n" +
                "  after editing .env.local — Next only reads it at startup.\n"
              : "")
      )
      return { ok: false, error: `Resend returned ${res.status}` }
    }

    console.log("[contact] ✓ email sent")

    return { ok: true }
  } catch (error) {
    console.error("[contact] network error talking to Resend:", error)
    return { ok: false, error: (error as Error).message }
  }
}

import { NextResponse } from "next/server"
import { contactSchema } from "@/lib/contact-schema"
import { sendContactEmail } from "@/lib/send-email"

/** Naive in-memory rate limit: 3 submissions per IP per 10 minutes. */
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 3
const hits = new Map<string, number[]>()

function rateLimited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) return true
  recent.push(now)
  hits.set(ip, recent)
  return false
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again later." },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the form and try again.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  // Honeypot tripped — pretend it worked so the bot doesn't retry.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true })
  }

  const { name, email, subject, message } = parsed.data

  const result = await sendContactEmail({ name, email, subject, message })

  if (!result.ok) {
    return NextResponse.json(
      { error: "Couldn't send that. Please email me directly instead." },
      { status: 502 }
    )
  }

  // `skipped` means no API key is configured — fine locally, worth flagging
  // to the client so the UI can be honest about it in development.
  return NextResponse.json({ ok: true, delivered: !result.skipped })
}

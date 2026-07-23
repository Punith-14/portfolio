import "server-only"

/**
 * Pulls a usable one-liner out of a repo's README.
 *
 * READMEs almost never open with prose — they open with a centered logo, a row
 * of shields.io badges, and a table of contents. So the job is mostly deciding
 * what to throw away before taking the first real sentence.
 */

/** Strip markdown/HTML noise that never belongs in a summary. */
function stripNoise(markdown: string): string {
  return (
    markdown
      // YAML frontmatter
      .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "")
      // fenced code blocks
      .replace(/```[\s\S]*?```/g, "\n\n")
      .replace(/~~~[\s\S]*?~~~/g, "\n\n")
      // HTML comments
      .replace(/<!--[\s\S]*?-->/g, "")
      // block-level HTML (centered logos, <p align="center"> badge rows, tables)
      .replace(/<(p|div|table|picture|h1|h2|h3|center)[\s\S]*?<\/\1>/gi, "\n\n")
      // self-closing / unclosed tags: <img>, <br/>, <a ...>
      .replace(/<[^>]+>/g, "")
  )
}

/** True if a line is decoration rather than prose. */
function isNoiseLine(line: string): boolean {
  const t = line.trim()

  if (!t) return true
  if (t.startsWith("#")) return true // heading
  if (/^[-*_]{3,}$/.test(t)) return true // horizontal rule
  if (/^\|/.test(t)) return true // table row
  if (/^\s*[-*+]\s/.test(t)) return true // list item (usually a TOC or feature list)
  if (/^\s*\d+\.\s/.test(t)) return true // numbered list
  if (/^>\s?/.test(t)) return true // blockquote

  // A line that is nothing but badges/images/links — the classic badge row.
  const withoutMedia = t
    .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, "") // linked badge
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // image
    .replace(/\[[^\]]*\]\([^)]*\)/g, "") // link
    .replace(/[\s|·—–-]/g, "")

  if (withoutMedia.length === 0) return true

  return false
}

/** Convert inline markdown to plain text. */
function toPlainText(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links → label
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // italic
    .replace(/~~(.*?)~~/g, "$1") // strikethrough
    .replace(/\s+/g, " ")
    .trim()
}

/** Cut to a whole sentence near the limit rather than mid-word. */
function truncate(text: string, max = 220): string {
  if (text.length <= max) return text

  const window = text.slice(0, max)
  const lastStop = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("! "),
    window.lastIndexOf("? ")
  )

  if (lastStop > max * 0.45) return window.slice(0, lastStop + 1).trim()

  const lastSpace = window.lastIndexOf(" ")
  return `${window.slice(0, lastSpace > 0 ? lastSpace : max).trim()}…`
}

/**
 * Extract the first meaningful paragraph. Returns null when the README is all
 * decoration and no prose, so the caller can fall through to the next source.
 */
export function extractReadmeSummary(
  markdown: string,
  minLength = 40
): string | null {
  if (!markdown?.trim()) return null

  const lines = stripNoise(markdown).split(/\r?\n/)

  let buffer: string[] = []

  const flush = (): string | null => {
    if (!buffer.length) return null
    const candidate = toPlainText(buffer.join(" "))
    buffer = []
    return candidate.length >= minLength ? candidate : null
  }

  for (const line of lines) {
    if (isNoiseLine(line)) {
      const found = flush()
      if (found) return truncate(found)
      continue
    }
    buffer.push(line.trim())
  }

  const trailing = flush()
  return trailing ? truncate(trailing) : null
}

/**
 * Fetch a repo's README and summarise it. Returns null on any failure —
 * missing README, rate limit, network error — so callers just move on.
 */
export async function getReadmeSummary(
  owner: string,
  repo: string
): Promise<string | null> {
  try {
    const headers: HeadersInit = { Accept: "application/vnd.github.raw" }
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    }

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { headers, next: { revalidate: 3600 } }
    )

    if (!res.ok) return null

    return extractReadmeSummary(await res.text())
  } catch {
    return null
  }
}

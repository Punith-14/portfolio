import "server-only"

import { cache } from "react"
import { GoogleGenAI } from "@google/genai"
import { hiddenRepos, projectOverrides, siteConfig } from "@/lib/site-config"
import { getReadmeSummary } from "@/lib/readme"
import {
  getCachedDescription,
  pruneCache,
  setCachedDescription,
} from "@/lib/description-cache"

const GITHUB_USERNAME = siteConfig.github

export interface Project {
  title: string
  description: string
  tech: string[]
  githubUrl: string
  liveUrl: string
  stars: number
  updatedAt: string
  /** You starred your own repo — pin it to the top. */
  featured: boolean
}

function githubHeaders(): HeadersInit {
  const headers: HeadersInit = { Accept: "application/vnd.github+json" }
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  return headers
}

/**
 * Names of your own repos that you've starred. Starring is the curation
 * mechanism: star a repo on GitHub and it jumps to the front of the portfolio,
 * no code change needed.
 *
 * Returns an empty set on failure — worst case nothing is featured.
 */
async function getFeaturedRepoNames(): Promise<Set<string>> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/starred?per_page=100`,
      { headers: githubHeaders(), next: { revalidate: 3600 } }
    )

    if (!res.ok) return new Set()

    const starred = (await res.json()) as any[]
    if (!Array.isArray(starred)) return new Set()

    return new Set(
      starred
        .filter((repo) => repo?.owner?.login === GITHUB_USERNAME)
        .map((repo) => String(repo.name).toLowerCase())
    )
  } catch {
    return new Set()
  }
}

/** Repos you never want on the site (case-insensitive). Edit in site-config. */
const HIDDEN_REPOS = new Set(hiddenRepos.map((r) => r.toLowerCase()))

/** Turn "my-cool-app" into "My Cool App". */
function titleize(name: string) {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Strip markdown artefacts out of model output. */
function cleanText(text: string) {
  return text
    .replace(/\*\*/g, "")
    .replace(/^#+\s*/gm, "")
    .replace(/`/g, "")
    .replace(/\s*\n+\s*/g, " ")
    .trim()
}

/** Last resort when we have no prose from any source. */
function genericDescription(name: string, tech: string[]) {
  const stack = tech.length ? ` Built with ${tech.join(", ")}.` : ""
  return `A ${titleize(name).toLowerCase()} project.${stack}`.replace(
    /\s+/g,
    " "
  )
}

/**
 * Model IDs are renamed and retired constantly, so instead of hardcoding one we
 * ask the API which models the key can actually use and pick the first match.
 * Preference order: cheapest/fastest first, then broader fallbacks.
 */
const MODEL_PREFERENCE = [
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.6-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
]

/** Resolved once per server process. null = resolution already failed. */
let modelPromise: Promise<string | null> | null = null

async function resolveModel(apiKey: string): Promise<string | null> {
  modelPromise ??= (async () => {
    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models?pageSize=200",
        { headers: { "x-goog-api-key": apiKey }, cache: "no-store" }
      )

      if (!res.ok) {
        console.warn(
          `[github] couldn't list Gemini models (${res.status}); using "${MODEL_PREFERENCE[0]}"`
        )
        return MODEL_PREFERENCE[0]
      }

      const data = (await res.json()) as {
        models?: { name: string; supportedGenerationMethods?: string[] }[]
      }

      const usable = new Set(
        (data.models ?? [])
          .filter((m) =>
            (m.supportedGenerationMethods ?? []).includes("generateContent")
          )
          .map((m) => m.name.replace(/^models\//, ""))
      )

      const picked =
        MODEL_PREFERENCE.find((m) => usable.has(m)) ??
        // nothing from the preference list — take any available flash model
        [...usable].find((m) => m.includes("flash")) ??
        [...usable][0]

      if (!picked) {
        console.warn("[github] no Gemini model supports generateContent")
        return null
      }

      console.log(`[github] using Gemini model "${picked}"`)
      return picked
    } catch (error) {
      console.warn("[github] model lookup failed:", (error as Error).message)
      return MODEL_PREFERENCE[0]
    }
  })()

  return modelPromise
}

/** Only log the first AI failure — otherwise every repo spams an identical stack. */
let warnedAboutAi = false

/**
 * Condense a long README down to two sentences. This is the one job an LLM is
 * actually good at here — it has real source material to work from, rather than
 * inventing prose from a repo name. Returns null so callers can fall through.
 */
async function summariseWithAi(
  name: string,
  source: string,
  tech: string[]
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  try {
    const model = await resolveModel(apiKey)
    if (!model) return null

    const client = new GoogleGenAI({ apiKey })

    const prompt = [
      "Summarise this project for a portfolio site.",
      "",
      `Project name: ${name}`,
      tech.length ? `Tech stack: ${tech.join(", ")}` : "",
      "",
      "Source material:",
      source.slice(0, 4000),
      "",
      "Rules:",
      "- Summarise ONLY what the source says. Do not invent features.",
      "- Do NOT repeat the project name",
      "- Do NOT use markdown or bullet points",
      "- Plain text, 2 short sentences, max 35 words total",
      "- Simple English, no buzzwords like 'cutting-edge' or 'seamless'",
    ]
      .filter(Boolean)
      .join("\n")

    const response = await client.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    })

    const raw = response.candidates?.[0]?.content?.parts?.[0]?.text
    const cleaned = raw ? cleanText(raw) : ""

    return cleaned || null
  } catch (error) {
    if (!warnedAboutAi) {
      warnedAboutAi = true
      console.warn(
        `[github] Gemini unavailable (${(error as Error).message.slice(0, 120)}). ` +
          "Using README and GitHub descriptions instead."
      )
    }
    return null
  }
}

type DescriptionSource = "override" | "github" | "readme" | "ai" | "generic"

/**
 * Resolve a project description, best source first:
 *
 *   1. override — what you wrote by hand in site-config
 *   2. github   — the repo's own description field
 *   3. readme   — first real paragraph of the README
 *   4. ai       — Gemini condensing the README (only if the paragraph was thin)
 *   5. generic  — name + tech stack
 *
 * Only 3–5 cost an API call, so only those get cached.
 */
async function resolveDescription(
  repoName: string,
  githubDescription: string,
  tech: string[],
  cacheKey: string
): Promise<{ text: string; source: DescriptionSource }> {
  // 1. Your own words always win.
  const override = projectOverrides[repoName.toLowerCase()]?.trim()
  if (override) return { text: override, source: "override" }

  // 2. The repo description is free and already in the payload — never cache it,
  //    so editing it on GitHub shows up on the next rebuild.
  const ghDescription = githubDescription?.trim()
  if (ghDescription) return { text: ghDescription, source: "github" }

  // 3–5 are expensive, so check the cache first.
  const cached = await getCachedDescription(cacheKey)
  if (cached) return { text: cached, source: "readme" }

  const readme = await getReadmeSummary(GITHUB_USERNAME, repoName)

  // A short README paragraph is usually a real tagline — use it as-is. A long
  // one is better handed to the model to condense.
  if (readme && readme.length <= 180) {
    await setCachedDescription(cacheKey, readme)
    return { text: readme, source: "readme" }
  }

  if (readme) {
    const summarised = await summariseWithAi(repoName, readme, tech)
    const text = summarised ?? readme
    await setCachedDescription(cacheKey, text)
    return { text, source: summarised ? "ai" : "readme" }
  }

  // Nothing to work from — don't let the model invent something.
  return { text: genericDescription(repoName, tech), source: "generic" }
}

/**
 * Fetch the user's own public repos, newest activity first, and enrich the top
 * ones with AI-written descriptions. Returns [] on any failure so the section
 * can render an empty state instead of crashing the page.
 *
 * Wrapped in React cache() so multiple renders in the same request share one
 * result instead of firing the whole GitHub + Gemini chain again.
 */
export const getProjects = cache(async (limit = 6): Promise<Project[]> => {
  try {
    // Both requests are independent — fire them together.
    const [res, featured] = await Promise.all([
      fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=pushed&type=owner`,
        { headers: githubHeaders(), next: { revalidate: 3600 } }
      ),
      getFeaturedRepoNames(),
    ])

    if (!res.ok) {
      console.error(`[github] repos request failed: ${res.status}`)
      return []
    }

    const repos = (await res.json()) as any[]
    if (!Array.isArray(repos)) return []

    const selected = repos
      .filter(
        (repo) =>
          !repo.fork &&
          !repo.archived &&
          !repo.private &&
          !HIDDEN_REPOS.has(String(repo.name).toLowerCase())
      )
      // Starred repos first, then by star count, then most recently pushed.
      .sort((a, b) => {
        const aFeatured = featured.has(String(a.name).toLowerCase())
        const bFeatured = featured.has(String(b.name).toLowerCase())
        if (aFeatured !== bFeatured) return aFeatured ? -1 : 1

        return (
          b.stargazers_count - a.stargazers_count ||
          new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
        )
      })
      .slice(0, limit)

    // Keyed on pushed_at so a description is only regenerated when the repo
    // itself changes — refreshing the page costs nothing.
    const cacheKeys = selected.map(
      (repo) => `${repo.name}@${repo.pushed_at}`
    )

    const sourceCounts: Record<string, number> = {}

    const projects = await Promise.all(
      selected.map(async (repo, i) => {
        const tech: string[] = [
          ...(repo.language ? [repo.language] : []),
          ...((repo.topics as string[] | undefined) ?? []).slice(0,8),
        ]

        const { text, source } = await resolveDescription(
          repo.name,
          repo.description ?? "",
          tech,
          cacheKeys[i]
        )

        sourceCounts[source] = (sourceCounts[source] ?? 0) + 1

        return {
          title: titleize(repo.name),
          description: text,
          tech,
          githubUrl: repo.html_url as string,
          liveUrl: (repo.homepage as string) || "",
          stars: (repo.stargazers_count as number) ?? 0,
          updatedAt: repo.pushed_at as string,
          featured: featured.has(String(repo.name).toLowerCase()),
        }
      })
    )

    // Forget descriptions for repos that dropped off the list or were pushed to.
    await pruneCache(cacheKeys)

    const summary = Object.entries(sourceCounts)
      .map(([source, n]) => `${n} ${source}`)
      .join(", ")
    const featuredCount = projects.filter((p) => p.featured).length
    console.log(
      `[github] ${projects.length} projects, ${featuredCount} featured ` +
        `(descriptions: ${summary})`
    )

    if (sourceCounts.generic) {
      console.log(
        `[github] ${sourceCounts.generic} repo(s) have no description or README — ` +
          "add one on GitHub, or write an entry in projectOverrides."
      )
    }

    return projects
  } catch (error) {
    console.error("[github] getProjects failed:", error)
    return []
  }
})

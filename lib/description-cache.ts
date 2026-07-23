import "server-only"

import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"

/**
 * Persistent cache for AI-generated project descriptions.
 *
 * Keys include the repo's `pushed_at` timestamp, so a description is only
 * regenerated when that repo actually changes — not on every page render.
 *
 * Stored in the OS temp dir: writable both locally and on serverless hosts
 * like Vercel (where only /tmp is writable). Losing it is harmless — the worst
 * case is one extra round of API calls.
 */

const CACHE_FILE = path.join(os.tmpdir(), "portfolio-descriptions.json")

type CacheShape = Record<string, string>

let memory: CacheShape | null = null
let writeQueue: Promise<void> = Promise.resolve()

async function load(): Promise<CacheShape> {
  if (memory) return memory

  let loaded: CacheShape = {}

  try {
    const raw = await fs.readFile(CACHE_FILE, "utf8")
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed === "object" && parsed !== null) {
      loaded = parsed as CacheShape
    }
  } catch {
    // missing or corrupt file — start fresh
  }

  memory = loaded
  return loaded
}

export async function getCachedDescription(
  key: string
): Promise<string | undefined> {
  const cache = await load()
  return cache[key]
}

export async function setCachedDescription(key: string, value: string) {
  const cache = await load()
  cache[key] = value

  // Serialise writes so concurrent repos can't clobber each other's file.
  writeQueue = writeQueue
    .then(() => fs.writeFile(CACHE_FILE, JSON.stringify(cache), "utf8"))
    .catch((error) => {
      console.warn(
        "[cache] couldn't persist descriptions:",
        (error as Error).message
      )
    })

  await writeQueue
}

/** Drop entries for repos that no longer appear, so the file can't grow forever. */
export async function pruneCache(validKeys: string[]) {
  const cache = await load()
  const valid = new Set(validKeys)
  let changed = false

  for (const key of Object.keys(cache)) {
    if (!valid.has(key)) {
      delete cache[key]
      changed = true
    }
  }

  if (changed) {
    try {
      await fs.writeFile(CACHE_FILE, JSON.stringify(cache), "utf8")
    } catch {
      // non-fatal
    }
  }
}

import { NextResponse } from "next/server"
import { getProjects } from "@/lib/github"

/**
 * Thin JSON wrapper around lib/github.ts.
 * The page itself calls getProjects() directly — this route exists only so the
 * data is available to anything external that wants it.
 */
export async function GET() {
  const projects = await getProjects()
  return NextResponse.json(projects)
}

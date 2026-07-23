import { Suspense } from "react"

import { Nav } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { ProjectSection } from "@/components/project-section"
import { ProjectSkeleton } from "@/components/project-skeleton"
import { ResumeSection } from "@/components/resume-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { ScrollProgress } from "@/components/ui/scroll-progress"
import { getProjects } from "@/lib/github"

/**
 * Rebuild the page at most once an hour. Without this the GitHub + Gemini
 * chain runs on every single request, which burns API quota fast.
 */
export const revalidate = 3600

/**
 * Streamed in its own boundary so the GitHub + Gemini round trip never blocks
 * the rest of the page from rendering.
 */
async function Projects() {
  const projects = await getProjects()
  return <ProjectSection projects={projects} />
}

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Nav />
      <main className="min-h-screen">
        <HeroSection />
        <AboutSection />
        <Suspense fallback={<ProjectSkeleton />}>
          <Projects />
        </Suspense>
        <ResumeSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}

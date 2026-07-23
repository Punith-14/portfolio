import { SectionHeading } from "@/components/section-heading"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Shown while the GitHub + Gemini requests resolve. Mirrors the real card
 * layout so nothing shifts when the data arrives.
 */
export function ProjectSkeleton() {
  return (
    <section id="work" className="section-padding relative bg-surface/50">
      <div className="container-width">
        <SectionHeading
          eyebrow="02 — Work"
          title="What I've been building"
          description="Machine learning pipelines, real-time vision systems, and the applications built around them."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/60 bg-card/50 p-6 sm:p-7"
            >
              <Skeleton className="h-6 w-2/5" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-4/5" />
              <div className="mt-5 flex gap-2">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
              <div className="mt-6 border-t border-border/50 pt-5">
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

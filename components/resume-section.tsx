import { ArrowDownToLine } from "lucide-react"

import { SectionHeading } from "@/components/section-heading"
import { Stagger, StaggerItem } from "@/components/ui/reveal"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { resumes } from "@/lib/site-config"

/**
 * Three role-specific résumés. Same work, framed for whichever role the reader
 * is hiring for — so they don't have to translate it themselves.
 */
export function ResumeSection() {
  return (
    <section id="resume" className="section-padding relative">
      <div className="container-width">
        <SectionHeading
          eyebrow="03 — Résumé"
          title="Pick the version that fits the role"
          description="The same projects, weighted differently depending on what you're hiring for."
        />

        <Stagger className="mt-14 grid gap-4 sm:grid-cols-3" stagger={0.08}>
          {resumes.map((resume) => (
            <StaggerItem key={resume.file} className="h-full">
              <a
                href={resume.file}
                download
                className="group block h-full focus-visible:outline-none"
              >
                <SpotlightCard className="flex h-full flex-col p-6">
                  <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl border border-border/60 bg-background/50 text-primary transition-transform duration-300 group-hover:translate-y-0.5">
                    <ArrowDownToLine className="h-5 w-5" />
                  </span>

                  <h3 className="text-base font-semibold tracking-tight">
                    {resume.label}
                  </h3>
                  <p className="mt-2 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {resume.description}
                  </p>

                  <span className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70 transition-colors group-hover:text-primary">
                    Download PDF
                  </span>
                </SpotlightCard>
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

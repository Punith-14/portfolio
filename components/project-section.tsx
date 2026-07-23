import { ArrowUpRight, FolderGit2, Github, Sparkles, Star } from "lucide-react"

import { SectionHeading } from "@/components/section-heading"
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"
import type { Project } from "@/lib/github"

function EmptyState() {
  return (
    <Reveal>
      <div className="mt-14 rounded-2xl border border-dashed border-border/70 px-6 py-16 text-center">
        <FolderGit2 className="mx-auto h-8 w-8 text-muted-foreground/60" />
        <p className="mt-4 text-sm text-muted-foreground">
          Projects couldn&apos;t be loaded right now.
        </p>
        <a
          href={siteConfig.social.github}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Browse them on GitHub
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </Reveal>
  )
}

export function ProjectSection({ projects }: { projects: Project[] }) {
  return (
    <section id="work" className="section-padding relative bg-surface/50">
      <div className="container-width">
        <SectionHeading
          eyebrow="02 — Work"
          title="What I've been building"
          description="Machine learning pipelines, real-time vision systems, and the applications built around them."
        />

        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2" stagger={0.07}>
            {projects.map((project) => (
              <StaggerItem key={project.githubUrl} className="h-full">
                <SpotlightCard
                  className={cn(
                    "flex h-full flex-col p-6 sm:p-7",
                    project.featured && "border-primary/35"
                  )}
                >
                  {project.featured && (
                    <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                      <Sparkles className="h-3 w-3" />
                      Featured
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {project.title}
                    </h3>
                    {project.stars > 0 && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 font-mono text-xs text-muted-foreground">
                        <Star className="h-3 w-3" />
                        {project.stars}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>

                  {project.tech.length > 0 && (
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {project.tech.map((tech) => (
                        <li
                          key={tech}
                          className="rounded-md bg-muted px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-6 flex items-center gap-4 border-t border-border/50 pt-5 text-sm">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group/link inline-flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Github className="h-4 w-4" />
                      Code
                    </a>
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="group/link inline-flex items-center gap-1.5 font-medium text-primary transition-colors hover:text-foreground"
                      >
                        Live demo
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                      </a>
                    )}
                  </div>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </Stagger>
        )}

        {projects.length > 0 && (
          <Reveal delay={0.1}>
            <div className="mt-12 text-center">
              <a
                href={siteConfig.social.github}
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-muted/50"
              >
                <Github className="h-4 w-4" />
                See everything on GitHub
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}

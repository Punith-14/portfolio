import { BarChart3, Bot, Brain, Eye, MapPin } from "lucide-react"

import { ProfilePhoto } from "@/components/profile-photo"
import { SectionHeading } from "@/components/section-heading"
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { services, siteConfig, skillGroups } from "@/lib/site-config"

const icons = {
  brain: Brain,
  eye: Eye,
  bot: Bot,
  chart: BarChart3,
} as const

export function AboutSection() {
  return (
    <section id="about" className="section-padding relative">
      <div className="container-width">
        <SectionHeading
          eyebrow="01 — About"
          title="Models are the easy part. Everything around them is the work."
        />

        {/*
          Two columns for bio + capability cards, then skills full-width below.
          The cards use self-start so they size to their content instead of
          stretching to match the taller bio column.
        */}
        <div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* Portrait + bio */}
          <div className="space-y-5">
            <Reveal>
              <div className="mb-10 flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                <ProfilePhoto size={140} />

                <div className="min-w-0">
                  <p className="text-xl font-semibold tracking-tight">
                    {siteConfig.name}
                  </p>
                  <p className="mt-1 text-sm font-medium text-primary">
                    {siteConfig.role}
                  </p>
                  <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {siteConfig.location}
                  </p>
                </div>
              </div>
            </Reveal>

            {siteConfig.about.paragraphs.map((paragraph, i) => (
              <Reveal key={i} delay={0.06 * i}>
                <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>

          {/* What I do */}
          <Stagger className="grid gap-4 self-start sm:grid-cols-2">
            {services.map((service) => {
              const Icon = icons[service.icon]
              return (
                <StaggerItem key={service.title}>
                  <SpotlightCard className="h-full p-5">
                    <div className="mb-3.5 grid h-10 w-10 place-items-center rounded-lg border border-border/60 bg-background/50 text-primary">
                      <Icon className="h-[18px] w-[18px]" />
                    </div>
                    <h3 className="text-[15px] font-semibold leading-snug">
                      {service.title}
                    </h3>
                    <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
                      {service.description}
                    </p>
                  </SpotlightCard>
                </StaggerItem>
              )
            })}
          </Stagger>
        </div>

        {/* Skills — full width so the chips have room to breathe */}
        <div className="mt-16 border-t border-border/50 pt-12">
          <Reveal>
            <h2 className="mb-10 text-2xl font-semibold tracking-tight sm:text-3xl">
              Skills
            </h2>
          </Reveal>

          <Stagger
            className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3"
            stagger={0.06}
          >
            {skillGroups.map((group) => (
              <StaggerItem key={group.title}>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
                  {group.title}
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-sm text-foreground/85 transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  )
}

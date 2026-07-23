import { Github, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react"

import { ContactForm } from "@/components/contact-form"
import { SectionHeading } from "@/components/section-heading"
import { Reveal } from "@/components/ui/reveal"
import { siteConfig } from "@/lib/site-config"

const socials = [
  { href: siteConfig.social.github, icon: Github, label: "GitHub" },
  { href: siteConfig.social.linkedin, icon: Linkedin, label: "LinkedIn" },
  { href: siteConfig.social.twitter, icon: Twitter, label: "Twitter" },
].filter((s) => Boolean(s.href))

const details = [
  { icon: Mail, label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
  siteConfig.phone
    ? { icon: Phone, label: "Phone", value: siteConfig.phone, href: `tel:${siteConfig.phone}` }
    : null,
  { icon: MapPin, label: "Location", value: siteConfig.location, href: null },
].filter(Boolean) as {
  icon: typeof Mail
  label: string
  value: string
  href: string | null
}[]

export function ContactSection() {
  return (
    <section id="contact" className="section-padding relative bg-surface/50">
      <div className="container-width">
        <SectionHeading
          eyebrow="04 — Contact"
          title="Let's talk"
          description="Have a role, a project, or a problem worth solving? Send a message and I'll get back to you."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <Reveal variant="left">
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm sm:p-8">
              <ContactForm />
            </div>
          </Reveal>

          <Reveal variant="right" delay={0.1}>
            <div className="space-y-10">
              <div className="space-y-5">
                {details.map(({ icon: Icon, label, value, href }) => {
                  const content = (
                    <>
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border/60 bg-background/50 text-primary transition-colors group-hover:border-primary/50">
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
                          {label}
                        </span>
                        <span className="mt-0.5 block truncate text-sm font-medium">
                          {value}
                        </span>
                      </span>
                    </>
                  )

                  return href ? (
                    <a
                      key={label}
                      href={href}
                      className="group flex items-center gap-4 transition-colors hover:text-primary"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={label} className="group flex items-center gap-4">
                      {content}
                    </div>
                  )
                })}
              </div>

              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
                  Find me online
                </h3>
                <div className="mt-4 flex gap-2">
                  {socials.map(({ href, icon: Icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={label}
                      className="grid h-11 w-11 place-items-center rounded-xl border border-border/60 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-foreground"
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-sm font-medium">
                    {siteConfig.availability}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  I usually reply within a day or two. For anything urgent,
                  email is the fastest way to reach me.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

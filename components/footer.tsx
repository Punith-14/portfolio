import { ArrowUp, Github, Linkedin, Mail, Twitter } from "lucide-react"

import { navItems, siteConfig } from "@/lib/site-config"

const socials = [
  { href: siteConfig.social.github, icon: Github, label: "GitHub" },
  { href: siteConfig.social.linkedin, icon: Linkedin, label: "LinkedIn" },
  { href: siteConfig.social.twitter, icon: Twitter, label: "Twitter" },
  { href: `mailto:${siteConfig.email}`, icon: Mail, label: "Email" },
].filter((s) => Boolean(s.href))

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="container-width px-6 py-14 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <a href="#home" className="flex items-center gap-2 font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[var(--palette-3)] to-[var(--palette-5)] text-xs font-bold text-white">
                {siteConfig.initials}
              </span>
              {siteConfig.shortName}
            </a>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {siteConfig.tagline}
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
              Navigate
            </h2>
            <ul className="mt-4 space-y-2.5">
              {navItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
              Elsewhere
            </h2>
            <div className="mt-4 flex gap-1">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-muted hover:text-foreground"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse items-center gap-4 border-t border-border/50 pt-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}. Built with Next.js,
            Tailwind, and Framer Motion.
          </p>
          <a
            href="#home"
            className="group inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </footer>
  )
}

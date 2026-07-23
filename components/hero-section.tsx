"use client"

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { ArrowDown, ArrowUpRight, Github, Linkedin, Mail } from "lucide-react"

import { Magnetic } from "@/components/ui/magnetic"
import { TextReveal } from "@/components/ui/text-reveal"
import { siteConfig } from "@/lib/site-config"
import { EASE } from "@/lib/motion"

const socials = [
  { href: siteConfig.social.github, icon: Github, label: "GitHub" },
  { href: siteConfig.social.linkedin, icon: Linkedin, label: "LinkedIn" },
  { href: `mailto:${siteConfig.email}`, icon: Mail, label: "Email" },
].filter((s) => Boolean(s.href))

export function HeroSection() {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()

  // Parallax the hero content slightly as the page scrolls away underneath it.
  const y = useTransform(scrollYProgress, [0, 0.2], [0, reduced ? 0 : 60])
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, reduced ? 1 : 0])

  return (
    <section
      id="home"
      // pt-28 clears the fixed 4rem navbar with room to spare. Because the
      // height is min-h (not h), a viewport too short for the content makes the
      // section grow instead of letting the top slide under the nav.
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 pb-28 pt-28 sm:px-8 lg:px-12"
    >
      {/* ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
          className="glow absolute left-1/2 top-1/3 h-[420px] w-[520px] -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <motion.div
        style={{ y, opacity }}
        className="container-width flex flex-col items-center text-center"
      >
        {/* availability chip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm sm:mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {siteConfig.availability}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.28 }}
          className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-primary sm:mb-5"
        >
          {siteConfig.role}
        </motion.p>

        <h1 className="max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
          <TextReveal text={siteConfig.name} delay={0.36} />
          <TextReveal
            text={siteConfig.tagline}
            delay={0.56}
            highlight={["AI", "software"]}
            className="mt-2 text-muted-foreground"
          />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.9 }}
          className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:mt-8 sm:text-lg"
        >
          {siteConfig.intro}
        </motion.p>

        {/* actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 1.05 }}
          className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row"
        >
          <Magnetic>
            <a
              href="#work"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background transition-transform active:scale-95"
            >
              View my work
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-muted/50 active:scale-95"
            >
              Get in touch
            </a>
          </Magnetic>
        </motion.div>

        {/* socials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.2 }}
          className="mt-8 flex items-center gap-1 sm:mt-10"
        >
          {socials.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer noopener"
              aria-label={label}
              className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-[18px] w-[18px]" />
            </a>
          ))}
        </motion.div>
      </motion.div>

      {/* scroll cue */}
      <motion.a
        href="#about"
        aria-label="Scroll to about section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/60 transition-colors hover:text-foreground"
      >
        <motion.span
          animate={reduced ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="block"
        >
          <ArrowDown className="h-5 w-5" />
        </motion.span>
      </motion.a>
    </section>
  )
}

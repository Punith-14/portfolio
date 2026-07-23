import type { Transition, Variants } from "framer-motion"

/**
 * Shared easing + variants so every section animates with the same physics.
 * cubic-bezier(0.16, 1, 0.3, 1) is "easeOutExpo" — fast start, long soft settle.
 */
export const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Animations replay every time an element enters the viewport, so these are
 * deliberately shorter and travel less than a one-shot reveal would. Big
 * movement is fine once; on every scroll pass it reads as twitchy.
 */
export const transition: Transition = {
  duration: 0.55,
  ease: EASE,
}

/** Standard fade + rise. Used by <Reveal>. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition },
}

/** Parent container that cascades its children. */
export const staggerContainer = (stagger = 0.08, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
})

/** Child of a staggerContainer — no own delay, the parent schedules it. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition },
}

/** Per-word hero headline reveal. */
export const wordReveal: Variants = {
  hidden: { opacity: 0, y: "0.6em" },
  visible: {
    opacity: 1,
    y: "0em",
    transition: { duration: 0.8, ease: EASE },
  },
}

/**
 * once: false — elements re-animate every time they scroll into view, going
 * down or back up.
 *
 * The margin shrinks the trigger area by 15% top and bottom, so an element
 * resets only once it's clearly off screen. Without that, anything sitting near
 * a viewport edge flickers as you scroll past it.
 */
export const viewportRepeat = {
  once: false,
  margin: "-15% 0px -15% 0px",
} as const

/** Kept for anything that should settle permanently after its first reveal. */
export const viewportOnce = { once: true, margin: "-80px" } as const

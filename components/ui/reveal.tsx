"use client"

import { motion, useReducedMotion, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  fadeUp,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerItem,
  viewportRepeat,
} from "@/lib/motion"

const presets = {
  up: fadeUp,
  fade: fadeIn,
  scale: scaleIn,
  left: slideInLeft,
  right: slideInRight,
} as const

interface RevealProps {
  children: React.ReactNode
  className?: string
  /** Which entrance to use. Default "up". */
  variant?: keyof typeof presets
  delay?: number
  /** Render as something other than a div. */
  as?: "div" | "section" | "li" | "span"
}

/**
 * Scroll-triggered entrance. Animates once, and collapses to a plain fade
 * when the user has "reduce motion" enabled at the OS level.
 */
export function Reveal({
  children,
  className,
  variant = "up",
  delay = 0,
  as = "div",
}: RevealProps) {
  const reduced = useReducedMotion()
  const MotionTag = motion[as]

  const variants: Variants = reduced ? fadeIn : presets[variant]

  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={viewportRepeat}
      variants={variants}
      transition={{ delay }}
      className={cn(className)}
    >
      {children}
    </MotionTag>
  )
}

interface StaggerProps {
  children: React.ReactNode
  className?: string
  stagger?: number
  delay?: number
}

/** Wrap a list so children cascade in one after another. */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  delay = 0,
}: StaggerProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportRepeat}
      variants={staggerContainer(reduced ? 0 : stagger, delay)}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

/** Direct child of <Stagger>. */
export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      variants={reduced ? fadeIn : staggerItem}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

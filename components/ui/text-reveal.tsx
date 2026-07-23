"use client"

import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import { wordReveal, staggerContainer, viewportRepeat } from "@/lib/motion"

interface TextRevealProps {
  text: string
  className?: string
  /** Delay before the first word starts, in seconds. */
  delay?: number
  /** Words listed here render in the accent gradient. */
  highlight?: string[]
}

/**
 * Reveals a headline word by word, each word sliding up out of a clipped row.
 * Falls back to a single fade when reduced motion is requested.
 */
export function TextReveal({
  text,
  className,
  delay = 0,
  highlight = [],
}: TextRevealProps) {
  const reduced = useReducedMotion()
  const words = text.split(" ")
  const highlighted = new Set(highlight.map((w) => w.toLowerCase()))

  if (reduced) {
    return (
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={viewportRepeat}
        transition={{ duration: 0.5, delay }}
        className={cn("block", className)}
      >
        {text}
      </motion.span>
    )
  }

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={viewportRepeat}
      variants={staggerContainer(0.06, delay)}
      className={cn("block", className)}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden
          className="inline-block overflow-hidden pb-[0.12em] align-bottom"
        >
          <motion.span
            variants={wordReveal}
            className={cn(
              "inline-block",
              highlighted.has(word.toLowerCase().replace(/[.,]/g, "")) &&
                "bg-gradient-to-r from-[var(--palette-3)] via-[var(--palette-4)] to-[var(--palette-5)] bg-clip-text text-transparent"
            )}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </motion.span>
  )
}

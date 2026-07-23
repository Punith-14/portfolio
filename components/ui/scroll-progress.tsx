"use client"

import { motion, useScroll, useSpring } from "framer-motion"

/** Thin gradient bar pinned under the navbar showing read progress. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-[var(--palette-3)] via-[var(--palette-4)] to-[var(--palette-5)]"
    />
  )
}

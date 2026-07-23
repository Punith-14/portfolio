"use client"

import { useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MagneticProps {
  children: React.ReactNode
  className?: string
  /** How far the element is allowed to drift toward the cursor, in px. */
  strength?: number
}

/**
 * Pulls its child gently toward the cursor on hover, then springs back.
 * Disabled entirely for reduced-motion users and on touch devices (no hover).
 */
export function Magnetic({ children, className, strength = 14 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const reduced = useReducedMotion()

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    setOffset({
      x: (relX / (rect.width / 2)) * strength,
      y: (relY / (rect.height / 2)) * strength,
    })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      animate={offset}
      transition={{ type: "spring", stiffness: 260, damping: 18, mass: 0.4 }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  )
}

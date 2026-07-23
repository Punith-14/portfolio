import Image from "next/image"

import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"

interface ProfilePhotoProps {
  className?: string
  /** Rendered size in px. The source is 640px, so it stays crisp on retina. */
  size?: number
  priority?: boolean
}

/**
 * Circular portrait.
 *
 * The source PNG has its background cut out, so the subject would otherwise
 * float on nothing. Three layers fix that: an ambient glow behind, a gradient
 * ring at the edge, and a tinted fill inside the circle for the figure to sit
 * against.
 */
export function ProfilePhoto({
  className,
  size = 148,
  priority = false,
}: ProfilePhotoProps) {
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {/* ambient glow */}
      <div
        aria-hidden
        className="glow absolute -inset-4 -z-10 rounded-full opacity-60"
      />

      {/* gradient ring */}
      <div
        aria-hidden
        className="absolute -inset-[2px] rounded-full bg-gradient-to-br from-[var(--palette-3)] via-[var(--palette-4)] to-[var(--palette-5)] opacity-80"
      />

      {/* inner surface the cutout sits on */}
      <div className="absolute inset-0 overflow-hidden rounded-full bg-gradient-to-b from-muted to-card ring-1 ring-inset ring-background/40">
        <Image
          src="/punith.png"
          alt={`${siteConfig.name}, ${siteConfig.role}`}
          width={size * 2}
          height={size * 2}
          priority={priority}
          className="h-full w-full object-cover object-top"
        />
      </div>
    </div>
  )
}

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { contactSchema, type ContactInput } from "@/lib/contact-schema"
import { cn } from "@/lib/utils"

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.2 }}
          className="pt-1.5 text-xs text-destructive"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

const labelClass =
  "mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
    // Without defaults, untouched fields are `undefined` rather than "" and
    // produce confusing "Required" errors instead of the real message.
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      website: "",
    },
  })

  /**
   * Runs when validation blocks the submit. Without this the button looks
   * broken if the offending field is scrolled out of view — the inline error
   * is there, you just can't see it.
   */
  function onInvalid(fieldErrors: typeof errors) {
    const first = Object.keys(fieldErrors)[0] as keyof ContactInput | undefined
    const count = Object.keys(fieldErrors).length

    toast.error(
      count === 1 ? "One field needs fixing" : `${count} fields need fixing`,
      { description: first ? fieldErrors[first]?.message : undefined }
    )

    if (first) setFocus(first)
  }

  async function onSubmit(values: ContactInput) {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error("[contact] server responded", res.status, data)
        toast.error(data.error ?? "Couldn't send that. Please try again.", {
          description: `Server returned ${res.status}.`,
        })
        return
      }

      // delivered === false means the server has no email key configured yet.
      if (data.delivered === false) {
        toast.success("Message received", {
          description:
            "Email delivery isn't configured yet — check the server console.",
        })
      } else {
        toast.success("Message sent", {
          description: "Thanks for reaching out — I'll reply soon.",
        })
      }

      reset()
    } catch (error) {
      console.error("[contact] request failed", error)
      toast.error("Network error", {
        description: "Check your connection and try again.",
      })
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      noValidate
      className="space-y-5"
    >
      {/* honeypot — hidden from humans, irresistible to bots */}
      <input
        {...register("website")}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <Input
            id="name"
            placeholder="Your name"
            aria-invalid={Boolean(errors.name)}
            className={cn("h-11 rounded-xl", errors.name && "border-destructive")}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            className={cn("h-11 rounded-xl", errors.email && "border-destructive")}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className={labelClass}>
          Subject
        </label>
        <Input
          id="subject"
          placeholder="What's this about?"
          aria-invalid={Boolean(errors.subject)}
          className={cn("h-11 rounded-xl", errors.subject && "border-destructive")}
          {...register("subject")}
        />
        <FieldError message={errors.subject?.message} />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <Textarea
          id="message"
          rows={6}
          placeholder="Tell me about the project or role…"
          aria-invalid={Boolean(errors.message)}
          className={cn(
            "resize-none rounded-xl",
            errors.message && "border-destructive"
          )}
          {...register("message")}
        />
        <FieldError message={errors.message?.message} />
      </div>

      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileTap={{ scale: 0.98 }}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background transition-opacity disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Send message
            <Send className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </>
        )}
      </motion.button>
    </form>
  )
}

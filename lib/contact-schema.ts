import { z } from "zod"

/** Shared between the client form and the API route so validation can't drift. */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name")
    .max(80, "That name is a little too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("That doesn't look like a valid email"),
  subject: z
    .string()
    .trim()
    .min(3, "Give your message a subject")
    .max(120, "Subject is too long"),
  message: z
    .string()
    .trim()
    .min(20, "Tell me a bit more — at least 20 characters")
    .max(2000, "Message is too long (2000 characters max)"),
  /** Hidden field. Bots fill it in; humans never see it. */
  website: z.string().max(0).optional(),
})

export type ContactInput = z.infer<typeof contactSchema>

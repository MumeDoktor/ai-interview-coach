import 'server-only'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  ANTHROPIC_API_KEY: z.string().min(1),
  GROQ_API_KEY: z.string().optional(),
})

export const env = envSchema.parse(process.env)
import 'server-only'
import Groq from 'groq-sdk'
import { env } from '@/lib/env'

const globalForGroq = global as typeof global & { groq?: Groq }

export const groq =
  globalForGroq.groq ??
  new Groq({ apiKey: env.GROQ_API_KEY ?? '' })

if (process.env.NODE_ENV !== 'production') globalForGroq.groq = groq

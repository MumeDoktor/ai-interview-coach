import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import { env } from '@/lib/env'

const globalForAnthropic = global as typeof global & { anthropic?: Anthropic }

export const claude =
  globalForAnthropic.anthropic ??
  new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

if (process.env.NODE_ENV !== 'production') globalForAnthropic.anthropic = claude

import { z } from 'zod'

export const CallReportSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  frameworksUsed: z.array(z.string()),
  communicationNotes: z.string(),
  recommendedPractice: z.array(z.string()),
})

export type TCallReport = z.infer<typeof CallReportSchema>

export interface TConversationTurn {
  role: 'USER' | 'AI'
  content: string
}

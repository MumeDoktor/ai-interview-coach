import { z } from 'zod'

export const TopicSchema = z.object({
  topic: z.string(),
  relevance: z.number(),
  description: z.string(),
})

export const CompanyProfileSchema = z.object({
  overview: z.string(),
  techStack: z.array(z.string()),
  culture: z.array(z.string()),
  interviewProcess: z.string(),
  recentHighlights: z.string(),
})

export const InterviewerAIProfileSchema = z.object({
  name: z.string(),
  background: z.string(),
  interviewStyle: z.string(),
  focusAreas: z.array(z.string()),
})

export const ReadinessInsightsSchema = z.object({
  keyStrengthsToHighlight: z.array(z.string()),
  watchOutFor: z.array(z.string()),
  talkingPoints: z.array(z.string()),
})

export const AnalysisSchema = z.object({
  topTopics: z.array(TopicSchema),
  companyProfile: CompanyProfileSchema,
  detectedInterviewers: z.array(z.string()).default([]),
  interviewerProfiles: z.array(InterviewerAIProfileSchema).default([]),
  suggestedQuestions: z.array(z.string()),
  readinessInsights: ReadinessInsightsSchema,
})

export type TAnalysis = z.infer<typeof AnalysisSchema>
export type TAnalysisTopic = z.infer<typeof TopicSchema>
export type TInterviewerAIProfile = z.infer<typeof InterviewerAIProfileSchema>

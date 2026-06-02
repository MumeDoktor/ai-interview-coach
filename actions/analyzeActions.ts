'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { claude } from '@/lib/claude'
import { AnalysisSchema } from '@/lib/types/analysis'

const InterviewerInputSchema = z.object({
  name: z.string().min(1),
  title: z.string().optional(),
  linkedinUrl: z.string().optional(),
})

const AnalyzeInputSchema = z.object({
  jobTitle: z.string().min(2, { message: 'Job title is required.' }),
  company: z.string().min(2, { message: 'Company name is required.' }),
  jobDescription: z.string().min(80, { message: 'Please paste the full job description.' }),
  interviewers: z.array(InterviewerInputSchema).default([]),
  resumeId: z.string().optional(),
  interviewStage: z.string().optional(),
  workArrangement: z.string().optional(),
  employmentType: z.string().optional(),
  jobLocation: z.string().max(120).optional(),
  jobNotes: z.string().max(600).optional(),
})

export type TAnalyzeResult =
  | { success: true; analysisId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

const RESUME_LIMIT = 3000

function buildCandidateContext(
  resumeText: string | null,
  jobInfo: {
    interviewStage?: string
    workArrangement?: string
    employmentType?: string
    jobLocation?: string
    jobNotes?: string
  },
): string | null {
  const parts: string[] = []

  if (resumeText) {
    parts.push(`CANDIDATE RESUME:\n${resumeText.slice(0, RESUME_LIMIT)}`)
  }

  const jobLines: string[] = []
  if (jobInfo.interviewStage) jobLines.push(`Interview stage: ${jobInfo.interviewStage}`)
  if (jobInfo.workArrangement) jobLines.push(`Work arrangement: ${jobInfo.workArrangement}`)
  if (jobInfo.employmentType) jobLines.push(`Employment type: ${jobInfo.employmentType}`)
  if (jobInfo.jobLocation) jobLines.push(`Location: ${jobInfo.jobLocation}`)
  if (jobInfo.jobNotes) jobLines.push(`Additional notes: ${jobInfo.jobNotes}`)

  if (jobLines.length > 0) {
    parts.push(`JOB DETAILS:\n${jobLines.join('\n')}`)
  }

  return parts.length > 0 ? parts.join('\n\n') : null
}

function buildPrompt(
  jobTitle: string,
  company: string,
  jobDescription: string,
  interviewers: z.infer<typeof InterviewerInputSchema>[],
  candidateContext: string | null,
): string {
  const interviewerSection =
    interviewers.length > 0
      ? interviewers
          .map(
            (i) =>
              `- ${i.name}${i.title ? ` (${i.title})` : ''}${i.linkedinUrl ? ` — ${i.linkedinUrl}` : ''}`,
          )
          .join('\n')
      : 'None provided — auto-detect from job description if any are mentioned.'

  const candidateSection = candidateContext
    ? `\nCANDIDATE CONTEXT (use to personalise readiness insights and suggested questions):\n${candidateContext}\n`
    : ''

  return `You are an expert interview intelligence analyst with deep knowledge of tech companies, hiring managers, and interview processes.

Analyze the following job posting and provide a comprehensive intelligence report. Be specific and actionable — not generic.

JOB TITLE: ${jobTitle}
COMPANY: ${company}

JOB DESCRIPTION:
${jobDescription}

KNOWN INTERVIEWERS / CALL GUESTS:
${interviewerSection}
${candidateSection}
Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):

{
  "topTopics": [
    {
      "topic": "topic name",
      "relevance": 85,
      "description": "why this topic is important for this specific role and company"
    }
  ],
  "companyProfile": {
    "overview": "2-3 sentences focused on what matters for interview prep",
    "techStack": ["React", "TypeScript"],
    "culture": ["Data-driven", "Move fast"],
    "interviewProcess": "Describe the typical hiring process at this company — number of rounds, format, what each stage focuses on",
    "recentHighlights": "Recent company news, product launches, challenges, or growth that a candidate should know"
  },
  "detectedInterviewers": ["names auto-detected from the job description"],
  "interviewerProfiles": [
    {
      "name": "Full Name",
      "background": "Their career background, current role, areas of expertise based on available information",
      "interviewStyle": "How they typically run interviews, what they look for in candidates, their known approach and focus",
      "focusAreas": ["Leadership", "System design", "Impact-driven thinking"]
    }
  ],
  "suggestedQuestions": [
    "Specific, realistic question tailored to this role and company — not generic"
  ],
  "readinessInsights": {
    "keyStrengthsToHighlight": ["3-4 specific strengths this company/role values most"],
    "watchOutFor": ["2-3 common mistakes or traps for this specific role/company"],
    "talkingPoints": ["3-4 company/role specific talking points to weave into answers naturally"]
  }
}

Guidelines:
- topTopics: 5-8 topics sorted by relevance (highest first). Relevance is 0-100.
- interviewerProfiles: include ALL interviewers listed AND any detected in the JD. If you have limited public info on someone, say so honestly in background.
- suggestedQuestions: 10-15 questions. Make them specific to this company and role, not generic interview questions.${candidateContext ? ' Where a candidate resume is provided, tailor readiness insights and questions to that background. Where interview stage is provided, weight topics toward what matters most for that stage.' : ''}
- detectedInterviewers: only include names explicitly found in the job description text.`
}

export async function analyzeJob(formData: FormData): Promise<TAnalyzeResult> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { success: false, error: 'You must be logged in.' }

  let interviewers: z.infer<typeof InterviewerInputSchema>[] = []
  try {
    const raw = formData.get('interviewers')
    if (raw) interviewers = JSON.parse(raw as string)
  } catch {
    interviewers = []
  }

  const parsed = AnalyzeInputSchema.safeParse({
    jobTitle: formData.get('jobTitle'),
    company: formData.get('company'),
    jobDescription: formData.get('jobDescription'),
    interviewers,
    resumeId: formData.get('resumeId') || undefined,
    interviewStage: formData.get('interviewStage') || undefined,
    workArrangement: formData.get('workArrangement') || undefined,
    employmentType: formData.get('employmentType') || undefined,
    jobLocation: formData.get('jobLocation') || undefined,
    jobNotes: formData.get('jobNotes') || undefined,
  })

  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the form errors.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const {
    jobTitle,
    company,
    jobDescription,
    resumeId,
    interviewStage,
    workArrangement,
    employmentType,
    jobLocation,
    jobNotes,
  } = parsed.data
  const interviewerList = parsed.data.interviewers

  // Fetch resume text if one was selected
  let resumeText: string | null = null
  if (resumeId) {
    const resume = await db.resume.findFirst({ where: { id: resumeId, userId } })
    resumeText = resume?.rawText ?? null
  }

  const candidateContext = buildCandidateContext(resumeText, {
    interviewStage,
    workArrangement,
    employmentType,
    jobLocation,
    jobNotes,
  })

  const message = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system:
      'You are an expert interview intelligence analyst. Always respond with valid JSON only — no markdown code blocks, no preamble, no trailing text.',
    messages: [
      {
        role: 'user',
        content: buildPrompt(jobTitle, company, jobDescription, interviewerList, candidateContext),
      },
    ],
  })

  const rawText =
    message.content[0]?.type === 'text' ? message.content[0].text.trim() : ''

  let rawAnalysis: unknown
  try {
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()
    rawAnalysis = JSON.parse(cleaned)
  } catch {
    return { success: false, error: 'AI returned an unexpected response. Please try again.' }
  }

  const analysisResult = AnalysisSchema.safeParse(rawAnalysis)
  if (!analysisResult.success) {
    return { success: false, error: 'AI analysis was incomplete. Please try again.' }
  }

  const jobAnalysis = await db.jobAnalysis.create({
    data: {
      userId,
      jobTitle,
      company,
      jobDescription,
      analysis: analysisResult.data,
      candidateContext,
      interviewers: {
        create: interviewerList.map((i) => ({
          name: i.name,
          title: i.title ?? null,
          linkedinUrl: i.linkedinUrl ?? null,
        })),
      },
    },
  })

  return { success: true, analysisId: jobAnalysis.id }
}

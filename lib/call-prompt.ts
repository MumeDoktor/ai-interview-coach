import 'server-only'
import type { TAnalysis } from '@/lib/types/analysis'
import type { TConversationTurn } from '@/lib/types/call'

const CONTEXT_LIMIT = 2000

export function buildInterviewerSystemPrompt(
  jobTitle: string,
  company: string,
  analysis: TAnalysis,
  turnCount: number,
  candidateContext?: string | null,
): string {
  const interviewer = analysis.interviewerProfiles[0]
  const name = interviewer?.name ?? `${company} Hiring Manager`
  const style = interviewer?.interviewStyle ?? 'professional, warm, and direct'
  const topics = analysis.topTopics
    .slice(0, 5)
    .map((t) => t.topic)
    .join(', ')
  const culture = analysis.companyProfile.culture.slice(0, 3).join(', ')

  const candidateSection = candidateContext
    ? `\nCANDIDATE BACKGROUND (use to ask specific follow-ups — never read it out loud):\n${candidateContext.slice(0, CONTEXT_LIMIT)}\n`
    : ''

  return `You are ${name}, conducting a live phone interview at ${company} for a ${jobTitle} position.

Your interview style: ${style}

Key topics you plan to cover: ${topics}

Company culture signals to align with: ${culture}
${candidateSection}
STRICT RULES — follow these exactly:
1. Keep every single response under 55 words — this is a phone call, not an essay
2. Ask EXACTLY one question per turn — never two
3. React naturally to what the candidate just said before asking your next question (1 sentence reaction, then the question)
4. Never break character or reveal you are an AI
5. If an answer is vague, probe: "Can you be more specific?" or "What was the actual outcome?"
6. Progress through topics naturally over the conversation — don't rush
${turnCount === 0 ? '7. This is turn 0 — open with a warm 2-sentence intro (name + company) then your first question about their background' : `7. This is turn ${turnCount} — continue naturally from where you left off`}

You are on a real phone call. Be human. Be direct. Be interested.`
}

export function buildConversationMessages(
  turns: TConversationTurn[],
  newUserMessage?: string,
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = []

  for (const turn of turns) {
    messages.push({
      role: turn.role === 'USER' ? 'user' : 'assistant',
      content: turn.content,
    })
  }

  if (newUserMessage) {
    messages.push({ role: 'user', content: newUserMessage })
  }

  // Groq requires at least one user message for the first AI response
  if (messages.length === 0) {
    messages.push({ role: 'user', content: 'Begin the interview.' })
  }

  return messages
}

export function buildPostCallReportPrompt(
  jobTitle: string,
  company: string,
  turns: TConversationTurn[],
): string {
  const transcript = turns
    .map((t) => `${t.role === 'AI' ? 'Interviewer' : 'Candidate'}: ${t.content}`)
    .join('\n')

  return `Analyze this ${company} interview for the ${jobTitle} position and return a JSON performance report.

TRANSCRIPT:
${transcript}

Return ONLY valid JSON with this structure:
{
  "overallScore": 0-100,
  "summary": "2-3 sentence honest assessment of the candidate's performance",
  "strengths": ["3-4 specific things they did well with examples from the transcript"],
  "improvements": ["3-4 specific areas to improve with actionable advice"],
  "frameworksUsed": ["any STAR, CAR, SOAR, or other frameworks you detected"],
  "communicationNotes": "1-2 sentences on clarity, conciseness, confidence, pacing",
  "recommendedPractice": ["2-3 specific things to practice before the real interview"]
}`
}

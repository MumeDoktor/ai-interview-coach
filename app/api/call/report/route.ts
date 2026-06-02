import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { claude } from '@/lib/claude'
import { AnalysisSchema } from '@/lib/types/analysis'
import { CallReportSchema } from '@/lib/types/call'
import { buildPostCallReportPrompt } from '@/lib/call-prompt'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { sessionId } = (await req.json()) as { sessionId: string }

  const callSession = await db.callSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
    include: {
      analysis: true,
      turns: { orderBy: { timestamp: 'asc' } },
      report: true,
    },
  })

  if (!callSession) return new Response('Session not found', { status: 404 })
  if (callSession.report) return Response.json({ reportId: callSession.report.id })
  if (callSession.turns.length < 2) {
    return new Response('Not enough turns to generate a report', { status: 400 })
  }

  const analysisRecord = callSession.analysis
  const jobTitle = analysisRecord?.jobTitle ?? 'this role'
  const company = analysisRecord?.company ?? 'this company'

  const turns = callSession.turns.map((t) => ({
    role: t.role as 'USER' | 'AI',
    content: t.content,
  }))

  const prompt = buildPostCallReportPrompt(jobTitle, company, turns)

  const message = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system:
      'You are an expert interview coach. Respond with valid JSON only — no markdown, no preamble.',
    messages: [{ role: 'user', content: prompt }],
  })

  const rawText =
    message.content[0]?.type === 'text' ? message.content[0].text.trim() : ''

  let rawReport: unknown
  try {
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()
    rawReport = JSON.parse(cleaned)
  } catch {
    return new Response('Report generation failed', { status: 500 })
  }

  const reportResult = CallReportSchema.safeParse(rawReport)
  if (!reportResult.success) {
    return new Response('Report validation failed', { status: 500 })
  }

  const callReport = await db.callReport.create({
    data: {
      sessionId,
      overallScore: reportResult.data.overallScore,
      report: reportResult.data,
    },
  })

  // Mark session completed
  await db.callSession.update({
    where: { id: sessionId },
    data: { status: 'COMPLETED', endedAt: new Date() },
  })

  return Response.json({ reportId: callReport.id })
}

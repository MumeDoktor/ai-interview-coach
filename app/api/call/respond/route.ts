import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { groq } from '@/lib/groq'
import { env } from '@/lib/env'
import { AnalysisSchema } from '@/lib/types/analysis'
import {
  buildInterviewerSystemPrompt,
  buildConversationMessages,
} from '@/lib/call-prompt'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!env.GROQ_API_KEY) {
    return new Response('Voice service not configured', { status: 503 })
  }

  const { sessionId, userMessage } = (await req.json()) as {
    sessionId: string
    userMessage?: string
  }

  const callSession = await db.callSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
    include: {
      analysis: true,
      turns: { orderBy: { timestamp: 'asc' } },
    },
  })

  if (!callSession) {
    return new Response('Session not found', { status: 404 })
  }

  const analysisRecord = callSession.analysis
  const analysisResult = analysisRecord
    ? AnalysisSchema.safeParse(analysisRecord.analysis)
    : null
  const analysis = analysisResult?.success ? analysisResult.data : null

  const jobTitle = analysisRecord?.jobTitle ?? 'this role'
  const company = analysisRecord?.company ?? 'this company'
  const candidateContext = analysisRecord?.candidateContext ?? null

  const systemPrompt = analysis
    ? buildInterviewerSystemPrompt(jobTitle, company, analysis, callSession.turns.length, candidateContext)
    : `You are a professional interviewer at ${company} conducting a first-round interview for ${jobTitle}. Keep responses under 55 words. Ask one question at a time. Be warm and direct.`

  const conversationHistory = callSession.turns.map((t) => ({
    role: t.role as 'USER' | 'AI',
    content: t.content,
  }))

  const messages = buildConversationMessages(conversationHistory, userMessage)

  const stream = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 150,
    temperature: 0.85,
    stream: true,
  })

  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })

  return new Response(readableStream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { groq } from '@/lib/groq'
import { env } from '@/lib/env'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!env.GROQ_API_KEY) {
    return new Response('Voice service not configured', { status: 503 })
  }

  const formData = await req.formData()
  const audioFile = formData.get('audio') as File | null

  if (!audioFile) {
    return new Response('No audio provided', { status: 400 })
  }

  const transcription = await groq.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-large-v3',
    response_format: 'text',
    language: 'en',
  })

  return Response.json({ transcript: transcription })
}

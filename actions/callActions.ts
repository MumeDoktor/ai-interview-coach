'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export type TStartCallError = { error: string }

export async function startCall(analysisId: string): Promise<TStartCallError> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { error: 'Not authenticated.' }

  // Free tier: 1 completed call allowed
  const completedCalls = await db.callSession.count({
    where: { userId, status: 'COMPLETED' },
  })

  if (completedCalls >= 1) {
    return {
      error: 'You\'ve used your free call. Upgrade to Pro for unlimited interviews.',
    }
  }

  // Verify the analysis belongs to the user
  const analysis = await db.jobAnalysis.findFirst({
    where: { id: analysisId, userId },
    select: { id: true },
  })
  if (!analysis) return { error: 'Analysis not found.' }

  const callSession = await db.callSession.create({
    data: { userId, analysisId, status: 'IN_PROGRESS' },
  })

  redirect(`/dashboard/call/room/${callSession.id}`)
}

export async function endCall(sessionId: string): Promise<{ error?: string }> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { error: 'Not authenticated.' }

  await db.callSession.updateMany({
    where: { id: sessionId, userId, status: 'IN_PROGRESS' },
    data: { status: 'COMPLETED', endedAt: new Date() },
  })

  return {}
}

export async function saveTurn(
  sessionId: string,
  role: 'USER' | 'AI',
  content: string,
): Promise<{ error?: string }> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { error: 'Not authenticated.' }

  // Verify session ownership
  const callSession = await db.callSession.findFirst({
    where: { id: sessionId, userId },
    select: { id: true },
  })
  if (!callSession) return { error: 'Session not found.' }

  await db.callTurn.create({
    data: { sessionId, role, content },
  })

  return {}
}

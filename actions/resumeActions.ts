'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export type TDeleteResumeResult =
  | { success: true }
  | { success: false; error: string }

export async function deleteResume(resumeId: string): Promise<TDeleteResumeResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

  const resume = await db.resume.findFirst({
    where: { id: resumeId, userId: session.user.id },
  })
  if (!resume) return { success: false, error: 'Not found' }

  await db.resume.delete({ where: { id: resumeId } })
  return { success: true }
}

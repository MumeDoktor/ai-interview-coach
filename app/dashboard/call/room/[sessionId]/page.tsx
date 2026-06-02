import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { CallRoom } from './_components/CallRoom'

interface TProps {
  params: Promise<{ sessionId: string }>
}

export default async function CallRoomPage({ params }: TProps) {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const { sessionId } = await params

  const callSession = await db.callSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
    include: {
      analysis: { select: { jobTitle: true, company: true } },
    },
  })

  if (!callSession) notFound()
  if (callSession.status === 'COMPLETED') {
    redirect(`/dashboard/report/${sessionId}`)
  }

  return (
    <CallRoom
      sessionId={sessionId}
      jobTitle={callSession.analysis?.jobTitle ?? 'Interview'}
      company={callSession.analysis?.company ?? 'Company'}
      userName={session.user.name?.split(' ')[0] ?? 'there'}
    />
  )
}

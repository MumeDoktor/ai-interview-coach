import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { CallReportSchema } from '@/lib/types/call'
import { PostCallReport } from './_components/PostCallReport'

interface TProps {
  params: Promise<{ sessionId: string }>
}

export default async function ReportPage({ params }: TProps) {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const { sessionId } = await params

  const callSession = await db.callSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
    include: {
      analysis: { select: { jobTitle: true, company: true, id: true } },
      report: true,
      turns: { orderBy: { timestamp: 'asc' } },
    },
  })

  if (!callSession) notFound()

  // If report not ready yet, generate it
  if (!callSession.report && callSession.turns.length >= 2) {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/call/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
    redirect(`/dashboard/report/${sessionId}`)
  }

  if (!callSession.report) notFound()

  const reportResult = CallReportSchema.safeParse(callSession.report.report)
  if (!reportResult.success) notFound()

  const turns = callSession.turns.map((t) => ({
    role: t.role as 'USER' | 'AI',
    content: t.content,
    timestamp: t.timestamp,
  }))

  const duration = callSession.endedAt && callSession.startedAt
    ? Math.round((callSession.endedAt.getTime() - callSession.startedAt.getTime()) / 1000)
    : null

  return (
    <main className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <PostCallReport
          report={reportResult.data}
          overallScore={callSession.report.overallScore}
          jobTitle={callSession.analysis?.jobTitle ?? 'Interview'}
          company={callSession.analysis?.company ?? 'Company'}
          analysisId={callSession.analysis?.id}
          turns={turns}
          duration={duration}
        />
      </div>
    </main>
  )
}

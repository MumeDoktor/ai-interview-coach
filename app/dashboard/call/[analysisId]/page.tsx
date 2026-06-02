import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { AnalysisSchema } from '@/lib/types/analysis'
import { PreCallBriefing } from './_components/PreCallBriefing'

interface TProps {
  params: Promise<{ analysisId: string }>
}

export default async function PreCallPage({ params }: TProps) {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const { analysisId } = await params

  const record = await db.jobAnalysis.findFirst({
    where: { id: analysisId, userId: session.user.id },
    include: { interviewers: true },
  })
  if (!record) notFound()

  const analysisResult = AnalysisSchema.safeParse(record.analysis)
  if (!analysisResult.success) notFound()

  const completedCalls = await db.callSession.count({
    where: { userId: session.user.id, status: 'COMPLETED' },
  })

  return (
    <main className="flex min-h-[calc(100vh-0px)] flex-col items-center justify-center px-6 py-10">
      <PreCallBriefing
        analysisId={analysisId}
        jobTitle={record.jobTitle}
        company={record.company}
        analysis={analysisResult.data}
        hasUsedFreeCall={completedCalls >= 1}
      />
    </main>
  )
}

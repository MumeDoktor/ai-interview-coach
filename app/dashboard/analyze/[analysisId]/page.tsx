import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { AnalysisSchema } from '@/lib/types/analysis'
import { AnalysisReport } from './_components/AnalysisReport'

interface TProps {
  params: Promise<{ analysisId: string }>
}

export default async function AnalysisResultPage({ params }: TProps) {
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

  return (
    <main className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <AnalysisReport record={record} analysis={analysisResult.data} />
      </div>
    </main>
  )
}

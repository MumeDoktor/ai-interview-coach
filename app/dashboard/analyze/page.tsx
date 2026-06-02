import { Sparkles } from 'lucide-react'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { AnalyzeForm } from './_components/AnalyzeForm'

export default async function AnalyzePage() {
  const session = await auth()
  const resumes = session?.user?.id
    ? await db.resume.findMany({
        where: { userId: session.user.id },
        orderBy: { uploadedAt: 'desc' },
        select: { id: true, fileName: true, fileSize: true, uploadedAt: true },
      })
    : []

  const initialResumes = resumes.map((r) => ({
    id: r.id,
    fileName: r.fileName,
    fileSize: r.fileSize,
    uploadedAt: r.uploadedAt.toISOString(),
  }))

  return (
    <main className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
            <Sparkles className="h-3 w-3" />
            Context-aware AI
          </div>
          <h1 className="text-2xl font-bold text-white">Analyze a job posting</h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Paste the job description and tell us who you&apos;ll be talking to. We&apos;ll
            research everything — role requirements, company culture, and each interviewer&apos;s
            style — then build a tailored intelligence report for your session.
          </p>
        </div>

        <AnalyzeForm initialResumes={initialResumes} />
      </div>
    </main>
  )
}

import Link from 'next/link'
import type { TCallReport } from '@/lib/types/call'
import {
  Trophy,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  Phone,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

interface TTurnRow {
  role: 'USER' | 'AI'
  content: string
  timestamp: Date
}

interface TProps {
  report: TCallReport
  overallScore: number
  jobTitle: string
  company: string
  analysisId?: string | null
  turns: TTurnRow[]
  duration: number | null
}

function ScoreArc({ score }: { score: number }) {
  const color =
    score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'
  const ring =
    score >= 75 ? 'border-emerald-500/30 bg-emerald-500/10' : score >= 50 ? 'border-amber-500/30 bg-amber-500/10' : 'border-red-500/30 bg-red-500/10'
  return (
    <div className={`flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 ${ring}`}>
      <span className={`text-3xl font-bold ${color}`}>{score}</span>
      <span className="text-xs text-zinc-500">/ 100</span>
    </div>
  )
}

export function PostCallReport({
  report,
  overallScore,
  jobTitle,
  company,
  analysisId,
  turns,
  duration,
}: TProps) {
  const durationStr = duration
    ? `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <ScoreArc score={overallScore} />
          <div>
            <h1 className="text-xl font-bold text-white">Interview complete</h1>
            <p className="text-sm text-zinc-400">{jobTitle} · {company}</p>
            {durationStr && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-600">
                <Clock className="h-3 w-3" />
                {durationStr} call duration
              </div>
            )}
          </div>
        </div>
        {analysisId && (
          <Link
            href={`/dashboard/call/${analysisId}`}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            <Phone className="h-4 w-4" />
            Practice again
          </Link>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-violet-400" />
          <h2 className="font-semibold text-white">Performance summary</h2>
        </div>
        <p className="text-sm leading-relaxed text-zinc-300">{report.summary}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Strengths */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <h2 className="font-semibold text-white">What you did well</h2>
          </div>
          <ul className="space-y-2.5">
            {report.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h2 className="font-semibold text-white">Areas to improve</h2>
          </div>
          <ul className="space-y-2.5">
            {report.improvements.map((imp, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                {imp}
              </li>
            ))}
          </ul>
        </div>

        {/* Communication + frameworks */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-teal-400" />
            <h2 className="font-semibold text-white">Communication</h2>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-zinc-400">{report.communicationNotes}</p>
          {report.frameworksUsed.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-600">Frameworks detected</p>
              <div className="flex flex-wrap gap-1.5">
                {report.frameworksUsed.map((f) => (
                  <span key={f} className="rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-0.5 text-xs text-teal-300">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Practice recommendations */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-violet-400" />
            <h2 className="font-semibold text-white">Practice before the real thing</h2>
          </div>
          <ul className="space-y-2.5">
            {report.recommendedPractice.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-violet-400" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Full transcript */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/25">
        <div className="border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-zinc-500" />
            <h2 className="font-semibold text-white">Full transcript</h2>
            <span className="text-xs text-zinc-600">({turns.length} turns)</span>
          </div>
        </div>
        <div className="space-y-3 px-5 py-5">
          {turns.map((turn, i) => (
            <div key={i} className={`flex gap-3 ${turn.role === 'USER' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${turn.role === 'AI' ? 'bg-violet-700 text-violet-200' : 'bg-zinc-700 text-zinc-300'}`}>
                {turn.role === 'AI' ? 'I' : 'Y'}
              </div>
              <div className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${turn.role === 'AI' ? 'bg-zinc-800/60 text-zinc-300' : 'bg-violet-600/15 text-zinc-200'}`}>
                {turn.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

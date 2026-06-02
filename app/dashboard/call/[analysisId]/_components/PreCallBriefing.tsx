'use client'

import { useState, useTransition } from 'react'
import { BrainCircuit, Phone, Target, User, Building2, AlertCircle, Loader2 } from 'lucide-react'
import { startCall } from '@/actions/callActions'
import type { TAnalysis } from '@/lib/types/analysis'

interface TProps {
  analysisId: string
  jobTitle: string
  company: string
  analysis: TAnalysis
  hasUsedFreeCall: boolean
}

export function PreCallBriefing({ analysisId, jobTitle, company, analysis, hasUsedFreeCall }: TProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const interviewer = analysis.interviewerProfiles[0]
  const topTopics = analysis.topTopics.slice(0, 4)

  function handleStart() {
    setError(null)
    startTransition(async () => {
      const result = await startCall(analysisId)
      if ('error' in result) setError(result.error)
      // On success, startCall redirects automatically
    })
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-600/20">
          <Phone className="h-7 w-7 text-violet-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Incoming call</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {interviewer?.name ?? 'Your interviewer'} from {company} is ready
        </p>
      </div>

      {/* Call card */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
        {/* Caller info */}
        <div className="flex items-center gap-4 border-b border-zinc-800 px-6 py-5">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-violet-600/20 border border-violet-500/20 text-base font-bold text-violet-300">
            {company[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-semibold text-white">
              {interviewer?.name ?? `${company} Interviewer`}
            </p>
            <p className="text-sm text-zinc-500">
              {jobTitle} · {company}
            </p>
          </div>
        </div>

        {/* Briefing */}
        <div className="grid grid-cols-1 divide-y divide-zinc-800 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {/* Topics */}
          <div className="px-5 py-4">
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-teal-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Expect these topics</span>
            </div>
            <ul className="space-y-1.5">
              {topTopics.map((t) => (
                <li key={t.topic} className="flex items-center gap-2 text-sm text-zinc-300">
                  <span className="h-1 w-1 flex-shrink-0 rounded-full bg-teal-500" />
                  {t.topic}
                </li>
              ))}
            </ul>
          </div>

          {/* Interviewer style */}
          <div className="px-5 py-4">
            <div className="mb-3 flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Their style</span>
            </div>
            {interviewer ? (
              <p className="text-sm leading-relaxed text-zinc-400">{interviewer.interviewStyle}</p>
            ) : (
              <p className="text-sm text-zinc-500">Professional first-round interview format. Behavioral questions to start, then role-specific.</p>
            )}
          </div>
        </div>

        {/* Company culture bar */}
        <div className="border-t border-zinc-800 px-5 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-zinc-600" />
            {analysis.companyProfile.culture.slice(0, 4).map((c) => (
              <span key={c} className="rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-0.5 text-xs text-teal-300">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Free tier notice */}
      {!hasUsedFreeCall && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-zinc-700/60 bg-zinc-900/40 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
          <div className="text-sm">
            <span className="font-medium text-zinc-200">1 free call available</span>
            <span className="ml-1 text-zinc-500">— up to 5 minutes. Post-call report included.</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* CTA */}
      {hasUsedFreeCall ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-center">
          <p className="mb-1 font-medium text-amber-300">Free call used</p>
          <p className="text-sm text-zinc-500">Upgrade to Pro for unlimited AI interviews.</p>
        </div>
      ) : (
        <button
          onClick={handleStart}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-violet-600 py-4 text-base font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Phone className="h-5 w-5" />
          )}
          {isPending ? 'Connecting…' : 'Answer call'}
        </button>
      )}

      <p className="mt-4 text-center text-xs text-zinc-600">
        Make sure your microphone is allowed in the browser before answering.
      </p>
    </div>
  )
}

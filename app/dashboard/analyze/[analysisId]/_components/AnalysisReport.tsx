import type { TAnalysis } from '@/lib/types/analysis'
import type { InterviewerProfile, JobAnalysis } from '@/lib/generated/prisma/client'
import {
  Target,
  Building2,
  User,
  MessageSquare,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Phone,
} from 'lucide-react'
import Link from 'next/link'

type TProps = {
  record: JobAnalysis & { interviewers: InterviewerProfile[] }
  analysis: TAnalysis
}

export function AnalysisReport({ record, analysis }: TProps) {
  const { topTopics, companyProfile, interviewerProfiles, suggestedQuestions, readinessInsights, detectedInterviewers } = analysis

  const allInterviewerNames = [
    ...record.interviewers.map((i) => i.name),
    ...detectedInterviewers.filter(
      (name) => !record.interviewers.some((i) => i.name === name),
    ),
  ]

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-teal-500/25 bg-teal-600/15 text-base font-bold text-teal-400">
              {record.company[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{record.jobTitle}</h1>
              <p className="text-sm text-zinc-400">{record.company}</p>
              {allInterviewerNames.length > 0 && (
                <p className="mt-1 text-xs text-zinc-500">
                  Interviewers: {allInterviewerNames.join(', ')}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Link
              href={`/dashboard/call/${record.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
            >
              <Phone className="h-4 w-4" />
              Answer the call
            </Link>
            <Link
              href="/dashboard/analyze"
              className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
            >
              ← New analysis
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — 2/3 width */}
        <div className="space-y-6 lg:col-span-2">

          {/* Top interview topics */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-5 flex items-center gap-2.5">
              <Target className="h-4 w-4 text-teal-400" />
              <h2 className="font-semibold text-white">Top interview topics</h2>
            </div>
            <div className="space-y-3.5">
              {topTopics.map((t) => (
                <div key={t.topic}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-zinc-200">{t.topic}</span>
                    <span className="text-xs text-zinc-500">{t.relevance}%</span>
                  </div>
                  <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-teal-500/70"
                      style={{ width: `${t.relevance}%` }}
                    />
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-500">{t.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested questions */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-5 flex items-center gap-2.5">
              <MessageSquare className="h-4 w-4 text-teal-400" />
              <h2 className="font-semibold text-white">Likely interview questions</h2>
            </div>
            <ol className="space-y-3">
              {suggestedQuestions.map((q, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-500">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-zinc-300">{q}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Interviewer profiles */}
          {interviewerProfiles.length > 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-5 flex items-center gap-2.5">
                <User className="h-4 w-4 text-teal-400" />
                <h2 className="font-semibold text-white">Interviewer profiles</h2>
              </div>
              <div className="space-y-6">
                {interviewerProfiles.map((person) => (
                  <div key={person.name} className="rounded-xl border border-zinc-700/60 bg-zinc-900/40 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-xs font-bold text-violet-300">
                        {person.name[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{person.name}</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-600">Background</p>
                        <p className="leading-relaxed text-zinc-400">{person.background}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-600">Interview style</p>
                        <p className="leading-relaxed text-zinc-400">{person.interviewStyle}</p>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-600">Focus areas</p>
                        <div className="flex flex-wrap gap-1.5">
                          {person.focusAreas.map((area) => (
                            <span
                              key={area}
                              className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-xs text-violet-300"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — 1/3 width */}
        <div className="space-y-6">

          {/* Company intelligence */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <Building2 className="h-4 w-4 text-teal-400" />
              <h2 className="font-semibold text-white text-sm">Company intelligence</h2>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-zinc-400">{companyProfile.overview}</p>

            <div className="mb-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Tech stack</p>
              <div className="flex flex-wrap gap-1.5">
                {companyProfile.techStack.map((t) => (
                  <span key={t} className="flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">
                    <Cpu className="h-2.5 w-2.5" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Culture signals</p>
              <div className="flex flex-wrap gap-1.5">
                {companyProfile.culture.map((c) => (
                  <span key={c} className="rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-0.5 text-[11px] text-teal-300">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4 rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Interview process</p>
              <p className="text-xs leading-relaxed text-zinc-400">{companyProfile.interviewProcess}</p>
            </div>

            <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Recent highlights</p>
              <p className="text-xs leading-relaxed text-zinc-400">{companyProfile.recentHighlights}</p>
            </div>
          </div>

          {/* Readiness insights */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <Lightbulb className="h-4 w-4 text-teal-400" />
              <h2 className="font-semibold text-white text-sm">Readiness insights</h2>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Strengths to highlight</p>
              <ul className="space-y-1.5">
                {readinessInsights.keyStrengthsToHighlight.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-xs text-zinc-400">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-teal-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Watch out for</p>
              <ul className="space-y-1.5">
                {readinessInsights.watchOutFor.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-xs text-zinc-400">
                    <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-500" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Talking points</p>
              <ul className="space-y-1.5">
                {readinessInsights.talkingPoints.map((tp) => (
                  <li key={tp} className="flex items-start gap-2 text-xs text-zinc-400">
                    <RefreshCw className="mt-0.5 h-3 w-3 flex-shrink-0 text-violet-400" />
                    {tp}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

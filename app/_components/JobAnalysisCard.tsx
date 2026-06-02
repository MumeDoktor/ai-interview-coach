'use client'

import { CheckCircle2, Target, MessageCircle, Building2, User } from 'lucide-react'

const TOPICS = [
  { label: 'React & frontend architecture', score: 88 },
  { label: 'System design at scale',        score: 74 },
  { label: 'Cross-team collaboration',      score: 67 },
  { label: 'Leadership & ownership',        score: 58 },
]

const CULTURE_TAGS = ['API-first', 'Data-driven', 'Remote-async', 'High ownership']

export function JobAnalysisCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-2xl shadow-black/40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5">
        <span className="text-sm font-medium text-zinc-300">AI Job Analysis</span>
        <div className="flex items-center gap-1.5 text-xs text-teal-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Analysis ready
        </div>
      </div>

      {/* Job summary */}
      <div className="border-b border-zinc-800/60 px-5 py-4">
        <div className="flex items-start gap-3">
          {/* Company logo placeholder */}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#635bff]/30 bg-[#635bff]/15 text-sm font-bold text-[#8b84ff]">
            S
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Senior Frontend Engineer</p>
            <p className="mt-0.5 text-xs text-zinc-500">Stripe · Remote · Full-time</p>
            <div className="mt-2 flex items-center gap-1.5">
              <User className="h-3 w-3 text-zinc-600" />
              <span className="text-xs text-zinc-500">Sarah Chen, Engineering Manager</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis body */}
      <div className="space-y-4 px-5 py-4">

        {/* Top interview topics */}
        <div>
          <div className="mb-3 flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-teal-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
              Top interview topics
            </span>
          </div>
          <div className="space-y-2.5">
            {TOPICS.map(({ label, score }) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-zinc-300">{label}</span>
                  <span className="text-zinc-500">{score}%</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-teal-500/70"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interviewer style */}
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-800/30 p-3.5">
          <div className="mb-2 flex items-center gap-1.5">
            <MessageCircle className="h-3.5 w-3.5 text-teal-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
              Interviewer style
            </span>
          </div>
          <p className="text-xs leading-relaxed text-zinc-400">
            Sarah opens with empathy-based leadership questions before moving to technical
            deep-dives. Expect follow-ups on trade-offs and past failures.
          </p>
        </div>

        {/* Culture signals */}
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-teal-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
              Culture signals
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CULTURE_TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-1 text-xs text-teal-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-zinc-800/60 px-5 py-3.5">
        <div className="w-full rounded-lg border border-teal-500/20 bg-teal-600/10 py-2 text-center text-sm font-medium text-teal-300">
          ▶ Start tailored session
        </div>
      </div>
    </div>
  )
}

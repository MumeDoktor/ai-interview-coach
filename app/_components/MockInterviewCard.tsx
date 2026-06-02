'use client'

import { BrainCircuit, Mic } from 'lucide-react'

export function MockInterviewCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-2xl shadow-black/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
            <BrainCircuit className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-medium text-zinc-300">AI Interview Session</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </div>
      </div>

      {/* Chat area */}
      <div className="space-y-4 p-5">
        {/* Interviewer message */}
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-zinc-300">
            I
          </div>
          <div className="max-w-sm rounded-2xl rounded-tl-sm bg-zinc-800/60 px-4 py-3 text-sm leading-relaxed text-zinc-300">
            Walk me through a time you led your team through a major technical decision. What was the outcome?
          </div>
        </div>

        {/* User message */}
        <div className="flex justify-end gap-3">
          <div className="max-w-xs rounded-2xl rounded-tr-sm border border-violet-500/20 bg-violet-600/15 px-4 py-3 text-sm leading-relaxed text-zinc-200">
            &ldquo;In my last role I led the migration from our monolith to microservices. I ran a design sprint, aligned stakeholders, and we shipped in 6 weeks with zero downtime…&rdquo;
          </div>
          <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-violet-700 text-xs font-semibold text-white">
            Y
          </div>
        </div>

        {/* AI feedback panel */}
        <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/40 p-4">
          <div className="mb-3 flex items-center gap-2">
            <BrainCircuit className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
              AI Feedback
            </span>
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
              ✓ Strong STAR structure
            </span>
            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
              ✓ Clear leadership signal
            </span>
            <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400">
              ⚡ Quantify the impact
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Answer score</span>
            <span className="font-bold text-violet-400">84 / 100</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-400"
              style={{ width: '84%' }}
            />
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3">
          <Mic className="h-4 w-4 flex-shrink-0 text-zinc-500" />
          <span className="flex-1 text-sm text-zinc-600">Your answer…</span>
          <div className="flex items-center gap-1">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="inline-block h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { BrainCircuit, Mic, PhoneOff } from 'lucide-react'

const WAVE_HEIGHTS = [4, 10, 16, 22, 18, 26, 20, 24, 16, 12, 8, 4]

export function AudioCallCard() {
  return (
    <>
      <style>{`
        @keyframes waveBar {
          0%, 100% { transform: scaleY(0.25); opacity: 0.5; }
          50%       { transform: scaleY(1);    opacity: 1;   }
        }
      `}</style>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-2xl shadow-black/50 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
              <BrainCircuit className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-zinc-300">AI Voice Interview</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
            <span className="tabular-nums text-xs text-zinc-500">0:47</span>
          </div>
        </div>

        {/* Main area */}
        <div className="flex flex-col items-center px-6 py-8">
          {/* AI avatar with glow */}
          <div className="relative mb-5">
            <div className="absolute -inset-4 rounded-full bg-violet-500/15 blur-xl animate-pulse" />
            <div className="absolute -inset-1.5 rounded-full border border-violet-500/20 animate-pulse" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-violet-500/35 bg-violet-600/20">
              <BrainCircuit className="h-9 w-9 text-violet-400" />
            </div>
          </div>

          {/* AI label */}
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-violet-400">
            ARIA · AI Interviewer
          </p>
          <p className="mb-5 text-xs text-zinc-500">Speaking…</p>

          {/* Waveform */}
          <div className="mb-6 flex h-7 items-center gap-[3px]">
            {WAVE_HEIGHTS.map((h, i) => (
              <span
                key={i}
                className="inline-block w-[3px] rounded-full bg-violet-500"
                style={{
                  height: h,
                  animation: `waveBar 1.1s ease-in-out infinite`,
                  animationDelay: `${i * 85}ms`,
                  transformOrigin: 'center',
                }}
              />
            ))}
          </div>

          {/* Current question */}
          <p className="mb-7 max-w-xs text-center text-sm leading-relaxed text-zinc-300">
            &ldquo;Walk me through your approach to system design for a high-traffic,
            real-time application…&rdquo;
          </p>

          {/* Call controls */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <button
                disabled
                className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-zinc-500"
                aria-label="Microphone muted"
              >
                <Mic className="h-4.5 w-4.5" />
              </button>
              <span className="text-[10px] text-zinc-600">Muted</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                disabled
                className="flex h-11 w-11 items-center justify-center rounded-full border border-rose-500/30 bg-rose-600/15 text-rose-400"
                aria-label="End call"
              >
                <PhoneOff className="h-4.5 w-4.5" />
              </button>
              <span className="text-[10px] text-zinc-600">End call</span>
            </div>
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="border-t border-zinc-800/60 bg-zinc-900/40 px-5 py-3">
          <p className="text-center text-xs text-zinc-600">
            Full transcript and score delivered after the session
          </p>
        </div>
      </div>
    </>
  )
}

import { BrainCircuit, CheckCircle2 } from 'lucide-react'

const features = [
  'Realistic mock interviews tailored to your role',
  'Real-time AI feedback on your answers',
  'Track improvement across sessions',
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Brand panel — sticky, full height on desktop */}
      <div className="flex flex-col justify-between bg-zinc-900 p-8 lg:sticky lg:top-0 lg:h-screen lg:w-[440px] lg:shrink-0 lg:p-12">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
            <BrainCircuit className="size-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            AI Interview Coach
          </span>
        </div>

        <div className="hidden space-y-6 lg:block">
          <p className="text-2xl font-semibold leading-snug text-white">
            Ace your next interview with AI-powered practice and instant feedback.
          </p>
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                <span className="text-sm leading-relaxed text-zinc-300">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="hidden text-xs text-zinc-500 lg:block">
          © {new Date().getFullYear()} AI Interview Coach
        </p>
      </div>

      {/* Form panel — fills remaining space, centers content */}
      <div className="flex flex-1 items-center justify-center bg-zinc-50 p-8 dark:bg-zinc-950 lg:p-16">
        <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {children}
        </div>
      </div>
    </div>
  )
}
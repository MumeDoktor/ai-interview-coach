import { auth } from '@/lib/auth'
import Link from 'next/link'
import type { ComponentType } from 'react'
import {
  Target,
  FileSearch,
  Mic2,
  Clock,
  Trophy,
  Flame,
  MessageSquareDot,
  Crown,
  Sparkles,
} from 'lucide-react'

interface TFeatureCard {
  Icon: ComponentType<{ className?: string }>
  title: string
  description: string
  accent: 'violet' | 'teal' | 'amber'
  href?: string
  soon?: boolean
  premium?: boolean
}

const FEATURES: TFeatureCard[] = [
  {
    Icon: Target,
    title: 'Practice session',
    description: 'Start a mock interview on any topic, role, or seniority level. Get instant scored feedback.',
    accent: 'violet',
    soon: true,
  },
  {
    Icon: FileSearch,
    title: 'Job analysis',
    description: 'Paste a job posting, company name, and HR. AI builds a tailored session around the real role.',
    accent: 'teal',
    href: '/dashboard/analyze',
  },
  {
    Icon: Mic2,
    title: 'Voice interview',
    description: 'Talk to an AI HR in a live voice call. Dynamic follow-ups, tone analysis, full transcript.',
    accent: 'amber',
    soon: true,
    premium: true,
  },
]

const ACCENT = {
  violet: {
    icon: 'bg-violet-600/15 border-violet-500/20 text-violet-400',
    badge: 'border-violet-500/20 bg-violet-500/10 text-violet-300',
  },
  teal: {
    icon: 'bg-teal-600/15 border-teal-500/20 text-teal-400',
    badge: 'border-teal-500/20 bg-teal-500/10 text-teal-300',
  },
  amber: {
    icon: 'bg-amber-600/15 border-amber-500/20 text-amber-400',
    badge: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  },
} as const

export default async function DashboardPage() {
  const session = await auth()
  const firstName =
    session?.user?.name?.split(' ')[0] ??
    session?.user?.email?.split('@')[0] ??
    'there'

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="flex-1 px-6 py-8 lg:px-10">

      {/* ── Page header ────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{today}</p>
      </div>

      {/* ── Stats row ──────────────────────────────── */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            Icon: Trophy,
            label: 'Sessions completed',
            value: '0',
            sub: 'Start your first session',
          },
          {
            Icon: MessageSquareDot,
            label: 'Average score',
            value: '—',
            sub: 'Improve with each session',
          },
          {
            Icon: Flame,
            label: 'Day streak',
            value: '—',
            sub: 'Build a daily habit',
          },
        ].map(({ Icon, label, value, sub }) => (
          <div
            key={label}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-5 py-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                {label}
              </span>
              <Icon className="h-4 w-4 text-zinc-700" />
            </div>
            <p className="mb-1 text-3xl font-bold text-white">{value}</p>
            <p className="text-xs text-zinc-600">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Feature cards ──────────────────────────── */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Start practicing</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FEATURES.map(({ Icon, title, description, accent, href, soon, premium }) => {
            const colors = ACCENT[accent]
            const cardClass =
              'group relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all duration-200' +
              (href ? ' hover:border-teal-500/30 hover:bg-zinc-900 cursor-pointer' : '')

            const inner = (
              <>
                <div className="mb-4 flex items-start justify-between gap-2">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border ${colors.icon}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {premium && (
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${ACCENT.amber.badge}`}
                      >
                        <Crown className="mr-1 inline h-2.5 w-2.5" />
                        Pro
                      </span>
                    )}
                    {soon && (
                      <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                        Coming soon
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="mb-1.5 font-semibold text-white">{title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-zinc-400">{description}</p>
              </>
            )

            return href ? (
              <Link key={title} href={href} className={cardClass}>{inner}</Link>
            ) : (
              <div key={title} className={cardClass}>{inner}</div>
            )
          })}
        </div>
      </div>

      {/* ── Recent sessions ────────────────────────── */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-white">Recent sessions</h2>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/25">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
              <Clock className="h-5 w-5 text-zinc-600" />
            </div>
            <p className="mb-1 font-medium text-zinc-300">No sessions yet</p>
            <p className="mb-6 max-w-xs text-sm text-zinc-600">
              Complete your first practice session and it will appear here with your score
              and feedback.
            </p>
            <span className="inline-flex items-center rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-sm text-zinc-500">
              <Sparkles className="mr-2 h-3.5 w-3.5 text-zinc-600" />
              Sessions available soon
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}

import Link from 'next/link'
import type { ComponentType } from 'react'
import {
  BrainCircuit,
  Zap,
  Target,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Crown,
  Mic2,
  RefreshCw,
  BarChart2,
  Sparkles,
  FileSearch,
  Globe,
  UserSearch,
} from 'lucide-react'
import { RoleCycler } from './_components/RoleCycler'
import { MockInterviewCard } from './_components/MockInterviewCard'
import { AudioCallCard } from './_components/AudioCallCard'
import { JobAnalysisCard } from './_components/JobAnalysisCard'

interface TFeature {
  Icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

interface TStep {
  title: string
  description: string
}

const FEATURES: TFeature[] = [
  {
    Icon: Target,
    title: 'Role-tailored questions',
    description:
      'Questions calibrated to your target role, level, and company — from FAANG behavioral to startup system design.',
  },
  {
    Icon: Zap,
    title: 'Instant AI feedback',
    description:
      'Scored answers with specific, actionable improvements. Know exactly what to change — not just "be more specific."',
  },
  {
    Icon: TrendingUp,
    title: 'Track your growth',
    description:
      'Visualize improvement across sessions. Spot weak areas and focus practice where it matters most.',
  },
]

const STEPS: TStep[] = [
  {
    title: 'Choose your target role',
    description:
      'Select your job title, seniority, and target companies. Every session is tailored to your situation.',
  },
  {
    title: 'Answer realistic questions',
    description:
      'Practice behavioral, technical, and situational questions under timed, interview-like conditions.',
  },
  {
    title: 'Get detailed AI analysis',
    description:
      'Receive scored feedback with specific suggestions — see your strengths and exactly where to improve.',
  },
  {
    title: "Iterate until you're ready",
    description:
      "Use your progress data to focus sessions. When scores are consistent, you're ready to interview.",
  },
]

const STATS = [
  { stat: '10,000+', label: 'practice sessions' },
  { stat: '50+', label: 'question categories' },
  { stat: '4.9 / 5', label: 'avg. user rating' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-950 text-white">

      {/* ── Navigation ─────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
              <BrainCircuit className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight">AI Interview Coach</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/sign-up"
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>
      <section className="relative flex flex-col items-center px-6 pb-24 pt-40">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: [
                'radial-gradient(ellipse 75% 55% at 15% -10%, rgba(139,92,246,0.22) 0%, transparent 55%)',
                'radial-gradient(ellipse 65% 55% at 88% 105%, rgba(59,130,246,0.18) 0%, transparent 55%)',
              ].join(','),
            }}
          />
        </div>

        <div className="relative z-10 flex max-w-3xl flex-col items-center text-center">
          {/* Role badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3.5 py-1.5 text-sm">
            <Zap className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-zinc-400">Tailored for</span>
            <span className="font-medium text-violet-300">
              <RoleCycler />
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-bold leading-none tracking-tight">
            <span className="block text-5xl text-white sm:text-6xl md:text-7xl">
              Ace every
            </span>
            <span
              className="block bg-clip-text text-5xl text-transparent sm:text-6xl md:text-7xl"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #ffffff 0%, #c4b5fd 45%, #818cf8 75%, #93c5fd 100%)',
              }}
            >
              interview.
            </span>
          </h1>

          <p className="mb-10 max-w-xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            Practice with an AI that thinks like a real interviewer. Get instant, structured
            feedback on every answer — and walk into your next interview ready.
          </p>

          <div className="mb-12 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-violet-600 px-8 text-base font-medium text-white transition-colors hover:bg-violet-500"
            >
              Start practicing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-zinc-500">
            {STATS.map(({ stat, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-violet-500" />
                <span>
                  <span className="font-medium text-zinc-300">{stat}</span> {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mock interview card */}
        <div className="relative z-10 mt-16 w-full max-w-2xl">
          <MockInterviewCard />
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section className="border-t border-zinc-800/40 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Everything you need to prepare
            </h2>
            <p className="mx-auto max-w-lg text-lg text-zinc-400">
              From behavioral to technical — practice every type and get expert-level
              feedback in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {FEATURES.map(({ Icon, title, description }) => (
              <div
                key={title}
                className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-violet-500/30 hover:bg-zinc-900"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 transition-all duration-300 group-hover:border-violet-500/30 group-hover:bg-violet-500/10">
                  <Icon className="h-5 w-5 text-zinc-400 transition-colors duration-300 group-hover:text-violet-400" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Job Context Intelligence ───────────────────── */}
      <section className="border-t border-zinc-800/40 px-6 py-24">
        <div className="mx-auto max-w-6xl grid grid-cols-1 items-center gap-12 lg:grid-cols-2">

          {/* Left: analysis card */}
          <JobAnalysisCard />

          {/* Right: text content */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              <span className="font-medium text-teal-300">Context-aware AI</span>
            </div>

            <h2 className="mb-5 text-3xl font-bold leading-tight text-white sm:text-4xl">
              Give us the job.
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 50%, #06b6d4 100%)',
                }}
              >
                We&apos;ll build the interview.
              </span>
            </h2>

            <p className="mb-8 text-lg leading-relaxed text-zinc-400">
              Paste the job posting, add the company name, and drop in your interviewer&apos;s
              name. Our AI reads between the lines — extracting what they actually test
              for, how the interviewer operates, and what the company really values —
              so every practice session mirrors the real thing.
            </p>

            <ul className="mb-8 space-y-4">
              {[
                {
                  Icon: FileSearch,
                  text: 'Extracts likely interview topics and weighting directly from the job description',
                },
                {
                  Icon: Globe,
                  text: 'Researches company culture, recent news, and engineering values',
                },
                {
                  Icon: UserSearch,
                  text: 'Profiles your specific interviewer\'s known style, questions, and patterns',
                },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-500/15">
                    <Icon className="h-3 w-3 text-teal-400" />
                  </div>
                  <span className="text-sm leading-relaxed text-zinc-300">{text}</span>
                </li>
              ))}
            </ul>

          </div>
        </div>
      </section>

      {/* ── Premium: Audio Interview ───────────────────── */}
      <section
        className="border-t border-zinc-800/40 px-6 py-24 relative"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(245,158,11,0.05) 0%, transparent 60%)',
        }}
      >
        <div className="mx-auto max-w-6xl grid grid-cols-1 items-center gap-12 lg:grid-cols-2">

          {/* Left: text content */}
          <div>
            <h2 className="mb-5 text-3xl font-bold leading-tight text-white sm:text-4xl">
              Talk to an AI HR
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fb923c 100%)',
                }}
              >
                in real time.
              </span>
            </h2>

            <p className="mb-8 text-lg leading-relaxed text-zinc-400">
              Stop typing answers. Our voice AI conducts dynamic, flowing interviews
              the way real hiring managers do — listening, adapting, and asking
              natural follow-ups based on everything you say.
            </p>

            <ul className="mb-8 space-y-4">
              {[
                { Icon: RefreshCw, text: 'Adapts in real time — no fixed scripts or rigid question banks' },
                { Icon: BarChart2, text: 'Analyses your tone, pace, and confidence alongside content' },
                { Icon: Mic2,      text: 'Full session transcript and detailed scoring after every call' },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/15">
                    <Icon className="h-3 w-3 text-amber-400" />
                  </div>
                  <span className="text-sm leading-relaxed text-zinc-300">{text}</span>
                </li>
              ))}
            </ul>

          </div>

          {/* Right: live call mockup */}
          <AudioCallCard />
        </div>
      </section>

      {/* ── How it works ───────────────────────────────── */}
      <section className="border-t border-zinc-800/40 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              How it works
            </h2>
            <p className="text-lg text-zinc-400">
              From setup to offer-ready in four simple steps.
            </p>
          </div>

          <ol className="space-y-4">
            {STEPS.map(({ title, description }, i) => (
              <li
                key={title}
                className="flex items-start gap-5 rounded-2xl border border-zinc-800/70 bg-zinc-900/25 p-5 transition-colors hover:border-zinc-700/60"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-violet-500/20 bg-violet-600/15">
                  <span className="text-sm font-bold text-violet-400">{i + 1}</span>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div
            className="relative overflow-hidden rounded-3xl border border-zinc-800 p-12 text-center"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 90% 80% at 50% 110%, rgba(139,92,246,0.18) 0%, transparent 60%)',
              backgroundColor: '#18181b',
            }}
          >
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
              <BrainCircuit className="h-6 w-6 text-white" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Ready to ace your next interview?
            </h2>
            <p className="mx-auto mb-8 max-w-md text-lg text-zinc-400">
              Join thousands of engineers and PMs who practice smarter and land the roles
              they want.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-violet-600 px-10 text-base font-medium text-white transition-colors hover:bg-violet-500"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-sm text-zinc-600">No credit card required</p>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/50 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-600">
              <BrainCircuit className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-zinc-500">AI Interview Coach</span>
          </div>
          <p className="text-xs text-zinc-700">
            © {new Date().getFullYear()} AI Interview Coach. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

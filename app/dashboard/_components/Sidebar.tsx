'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'
import { logout } from '@/actions/authActions'
import {
  BrainCircuit,
  LayoutDashboard,
  ScrollText,
  Settings,
  LogOut,
  FileSearch,
} from 'lucide-react'

interface TNavItem {
  href: string
  icon: ComponentType<{ className?: string }>
  label: string
  soon?: boolean
  premium?: boolean
}

const NAV: TNavItem[] = [
  { href: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/analyze',  icon: FileSearch,      label: 'Job Analysis' },
  { href: '/dashboard/sessions', icon: ScrollText,      label: 'My Sessions',     soon: true },
  { href: '/dashboard/settings', icon: Settings,        label: 'Settings',        soon: true },
]

interface TSidebarProps {
  user: { name?: string | null; email?: string | null }
}

export function Sidebar({ user }: TSidebarProps) {
  const pathname = usePathname()

  const initials =
    user.name?.[0]?.toUpperCase() ??
    user.email?.[0]?.toUpperCase() ??
    '?'

  const displayName = user.name ?? user.email ?? 'User'

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col sticky top-0 h-screen w-60 shrink-0 border-r border-zinc-800 bg-zinc-900">
        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-zinc-800 px-5 py-[18px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <BrainCircuit className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            AI Interview Coach
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV.map(({ href, icon: Icon, label, soon, premium }) => {
            const isActive = pathname === href
            const className = cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400',
              soon
                ? 'cursor-not-allowed opacity-40'
                : 'hover:bg-zinc-800/60 hover:text-zinc-200',
            )

            const inner = (
              <>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {premium && (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                    Pro
                  </span>
                )}
                {soon && !premium && (
                  <span className="text-[10px] text-zinc-600">Soon</span>
                )}
              </>
            )

            return soon ? (
              <div key={href} className={className}>{inner}</div>
            ) : (
              <Link key={href} href={href} className={className}>{inner}</Link>
            )
          })}
        </nav>

        {/* User + sign-out */}
        <div className="border-t border-zinc-800 px-3 py-4 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600/30 text-xs font-semibold text-violet-300">
              {initials}
            </div>
            <span className="flex-1 truncate text-sm text-zinc-400">{displayName}</span>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-800/60 hover:text-zinc-300"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile top bar ──────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
            <BrainCircuit className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">AI Interview Coach</span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </form>
      </header>
    </>
  )
}

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Sidebar } from './_components/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/sign-in')

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar user={session.user} />
      <div className="flex flex-1 flex-col">
        {children}
      </div>
    </div>
  )
}

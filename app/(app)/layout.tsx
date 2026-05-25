import { auth } from '@/src/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/src/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex bg-[#F9F8F6]">
      <Sidebar email={session.user?.email} name={session.user?.name} />
      <main className="flex-1 overflow-auto min-w-0 pt-14 md:pt-0">{children}</main>
    </div>
  )
}

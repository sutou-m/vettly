import { auth } from '@/src/lib/auth'
import { redirect } from 'next/navigation'
import { logout } from '@/src/lib/actions/auth'
import Link from 'next/link'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex bg-[#F9F8F6]">
      <aside className="w-60 shrink-0 bg-white border-r border-[#D0D8D6] flex flex-col">
        <div className="p-5 border-b border-[#D0D8D6]">
          <span className="text-lg font-bold text-[#1C2B35]">Vettly</span>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-sm text-[#1C2B35] hover:bg-[#E6F5F3] hover:text-[#00A896] transition-colors"
          >
            ダッシュボード
          </Link>
          <Link
            href="/candidates"
            className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-sm text-[#1C2B35] hover:bg-[#E6F5F3] hover:text-[#00A896] transition-colors"
          >
            候補者一覧
          </Link>
          <Link
            href="/positions"
            className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-sm text-[#1C2B35] hover:bg-[#E6F5F3] hover:text-[#00A896] transition-colors"
          >
            求人ポジション
          </Link>
        </nav>

        <div className="p-4 border-t border-[#D0D8D6]">
          <p className="text-xs text-[#6B7F7C] truncate mb-2">{session.user?.email}</p>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-[#6B7F7C] hover:text-[#00A896] transition-colors"
            >
              ログアウト
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto min-w-0">{children}</main>
    </div>
  )
}

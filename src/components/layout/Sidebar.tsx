'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Briefcase, Settings, LogOut } from 'lucide-react'
import { logout } from '@/src/lib/actions/auth'

const mainNav = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/candidates', label: '候補者管理', icon: Users },
  { href: '/positions', label: '求人ポジション', icon: Briefcase },
]

type SidebarProps = {
  email?: string | null
  name?: string | null
}

export function Sidebar({ email, name }: SidebarProps) {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-[#D0D8D6] flex flex-col h-screen sticky top-0">
      {/* ロゴ */}
      <div className="px-5 h-16 flex items-center border-b border-[#D0D8D6]">
        <span className="text-xl font-bold text-[#00A896] tracking-tight">Vettly</span>
      </div>

      {/* メインナビ */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        <p className="px-3 mb-1 text-[10px] font-semibold text-[#6B7F7C] uppercase tracking-widest">
          メインメニュー
        </p>
        {mainNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm transition-colors ${
              isActive(href)
                ? 'bg-[#E6F5F3] text-[#00A896] font-medium'
                : 'text-[#6B7F7C] hover:text-[#1C2B35] hover:bg-[#F4F6F5]'
            }`}
          >
            <Icon size={16} className="shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* 下部エリア */}
      <div className="px-3 py-3 border-t border-[#D0D8D6] flex flex-col gap-0.5">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm transition-colors ${
            isActive('/settings')
              ? 'bg-[#E6F5F3] text-[#00A896] font-medium'
              : 'text-[#6B7F7C] hover:text-[#1C2B35] hover:bg-[#F4F6F5]'
          }`}
        >
          <Settings size={16} className="shrink-0" />
          設定
        </Link>

        <div className="px-3 pt-3 pb-1 border-t border-[#D0D8D6] mt-1">
          {(name || email) && (
            <p className="text-xs text-[#6B7F7C] truncate mb-2">{name ?? email}</p>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 text-sm text-[#6B7F7C] hover:text-[#DC2626] transition-colors w-full"
            >
              <LogOut size={16} className="shrink-0" />
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}

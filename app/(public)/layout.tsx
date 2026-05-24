import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F6]">
      <header className="bg-white border-b border-[#D0D8D6]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#00A896] tracking-tight">
            Vettly
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-[#6B7F7C] hover:text-[#1C2B35] transition-colors px-3 py-2"
            >
              ログイン
            </Link>
            <Link
              href="/register"
              className="text-sm bg-[#00A896] hover:bg-[#008A7C] text-white px-4 py-2 rounded-[10px] font-medium transition-colors"
            >
              無料登録
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  )
}

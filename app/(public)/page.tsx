import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

const targetUsers = [
  '採用代行・RPO会社',
  '人材エージェント・ヘッドハンティング会社',
  '採用業務を効率化したい中小企業の人事部門',
]

export default function HomePage() {
  return (
    <div className="px-6">
      {/* Hero */}
      <section className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#E6F5F3] text-[#00A896] text-sm font-medium px-3 py-1.5 rounded-full mb-6">
            AIスクリーニング自動化
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1C2B35] leading-tight">
            採用スクリーニングを、<br />AIで革新する。
          </h1>
          <p className="mt-5 text-[#6B7F7C] leading-relaxed max-w-lg mx-auto">
            応募書類をアップロードするだけで、AIが要約・スキル抽出・スコアリングまで自動化。採用担当者が本来の仕事に集中できる環境を。
          </p>
          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <Link
              href="/register"
              className="bg-[#00A896] hover:bg-[#008A7C] text-white px-6 py-3 rounded-[10px] font-medium transition-colors"
            >
              無料ではじめる
            </Link>
            <Link
              href="/login"
              className="bg-white text-[#1C2B35] border border-[#D0D8D6] hover:bg-[#F4F6F5] px-6 py-3 rounded-[10px] font-medium transition-colors"
            >
              ログイン
            </Link>
          </div>
        </div>
      </section>

      {/* 対象ユーザー */}
      <section className="max-w-2xl mx-auto py-16 border-t border-[#D0D8D6]">
        <h2 className="text-lg font-semibold text-[#1C2B35] mb-6 text-center">
          こんな組織におすすめ
        </h2>
        <ul className="flex flex-col gap-3">
          {targetUsers.map((user) => (
            <li key={user} className="flex items-center gap-3 text-[#6B7F7C]">
              <CheckCircle2 size={18} className="text-[#00A896] shrink-0" />
              {user}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

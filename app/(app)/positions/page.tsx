import Link from 'next/link'
import { auth } from '@/src/lib/auth'
import { supabaseAdmin } from '@/src/lib/supabase'
import { PageHeader } from '@/src/components/ui/PageHeader'
import { Card } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Briefcase, Plus } from 'lucide-react'

export default async function PositionsPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const [{ data: positions }, { data: candidateRows }] = await Promise.all([
    supabaseAdmin
      .from('vet_positions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('vet_candidates')
      .select('position_id')
      .eq('user_id', session.user.id)
      .not('position_id', 'is', null),
  ])

  const countMap: Record<string, number> = {}
  for (const row of candidateRows ?? []) {
    if (row.position_id) {
      countMap[row.position_id] = (countMap[row.position_id] ?? 0) + 1
    }
  }

  const list = positions ?? []

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="求人ポジション管理"
        description="AIスコアリングの基準となるポジションを設定します"
        actions={
          <Link href="/positions/new">
            <Button>
              <Plus size={16} />
              新規ポジション作成
            </Button>
          </Link>
        }
      />

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-full bg-[#E6F5F3] flex items-center justify-center">
            <Briefcase size={28} className="text-[#00A896]" />
          </div>
          <div className="text-center">
            <p className="font-medium text-[#1C2B35]">ポジションがありません</p>
            <p className="mt-1 text-sm text-[#6B7F7C]">
              まずは求人ポジションを作成してください
            </p>
          </div>
          <Link href="/positions/new">
            <Button>
              <Plus size={16} />
              新規ポジション作成
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((position) => {
            const candidateCount = countMap[position.id] ?? 0
            const skills = position.required_skills ?? []

            return (
              <Card key={position.id} className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-[#1C2B35] leading-snug">{position.title}</h2>
                  <span
                    className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                      position.is_active
                        ? 'bg-[#E6F5F3] text-[#00A896]'
                        : 'bg-[#F4F6F5] text-[#6B7F7C]'
                    }`}
                  >
                    {position.is_active ? '公開中' : '非公開'}
                  </span>
                </div>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-[#F4F6F5] text-[#6B7F7C] px-2 py-0.5 rounded-[6px]"
                      >
                        {skill}
                      </span>
                    ))}
                    {skills.length > 3 && (
                      <span className="text-xs text-[#6B7F7C]">+{skills.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-sm text-[#6B7F7C]">
                    応募者{' '}
                    <span className="font-medium text-[#1C2B35]">{candidateCount}</span> 名
                  </span>
                  <Link href={`/positions/${position.id}`}>
                    <Button variant="secondary" size="sm">
                      編集
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

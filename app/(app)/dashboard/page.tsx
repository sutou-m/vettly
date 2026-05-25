import Link from 'next/link'
import { auth } from '@/src/lib/auth'
import { supabaseAdmin } from '@/src/lib/supabase'
import { PageHeader } from '@/src/components/ui/PageHeader'
import { Card } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { StatusBarChart } from '@/src/components/dashboard/StatusBarChart'
import { ScoreDistributionChart } from '@/src/components/dashboard/ScoreDistributionChart'
import { Users, TrendingUp, CalendarPlus, Mic, Upload } from 'lucide-react'
import type { CandidateStatus } from '@/src/types/database'

const STATUS_LABEL: Record<CandidateStatus, string> = {
  screening: '書類選考',
  reviewing: 'レビュー中',
  interview: '面接中',
  offered: '内定',
  rejected: '不採用',
  withdrawn: '辞退',
}

const STATUS_ORDER: CandidateStatus[] = [
  'screening', 'reviewing', 'interview', 'offered', 'rejected', 'withdrawn',
]

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const [{ data: rawCandidates }, { data: rawPositions }] = await Promise.all([
    supabaseAdmin
      .from('vet_candidates')
      .select('id, name, score, status, created_at, position_id')
      .eq('user_id', session.user.id),
    supabaseAdmin
      .from('vet_positions')
      .select('id, title')
      .eq('user_id', session.user.id)
      .order('title'),
  ])

  const candidates = rawCandidates ?? []
  const positions = rawPositions ?? []

  // ── サマリ集計 ────────────────────────────────────────────
  const totalCandidates = candidates.length

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const thisWeekNew = candidates.filter((c) => new Date(c.created_at) >= weekAgo).length

  const withScore = candidates.filter((c) => c.score != null)
  const avgScore =
    withScore.length > 0
      ? Math.round(withScore.reduce((sum, c) => sum + c.score!, 0) / withScore.length)
      : null

  const interviewCount = candidates.filter((c) => c.status === 'interview').length

  // ── ステータス別データ ────────────────────────────────────
  const statusCounts = STATUS_ORDER.map((s) => ({
    status: s,
    label: STATUS_LABEL[s],
    count: candidates.filter((c) => c.status === s).length,
  }))

  // ── スコア分布 ────────────────────────────────────────────
  const scoreDist = [
    {
      range: '低（0〜49）',
      count: withScore.filter((c) => c.score! < 50).length,
      color: '#DC2626',
    },
    {
      range: '中（50〜74）',
      count: withScore.filter((c) => c.score! >= 50 && c.score! < 75).length,
      color: '#D97706',
    },
    {
      range: '高（75〜100）',
      count: withScore.filter((c) => c.score! >= 75).length,
      color: '#00A896',
    },
  ]

  // ── ポジション別サマリ ────────────────────────────────────
  const positionSummary = positions.map((pos) => {
    const posCandidates = candidates.filter((c) => c.position_id === pos.id)
    const posWithScore = posCandidates.filter((c) => c.score != null)

    const posAvgScore =
      posWithScore.length > 0
        ? Math.round(posWithScore.reduce((sum, c) => sum + c.score!, 0) / posWithScore.length)
        : null

    const topCandidate =
      posWithScore.length > 0
        ? posWithScore.reduce((best, c) => (c.score! > best.score! ? c : best), posWithScore[0])
        : null

    const unprocessed = posCandidates.filter((c) =>
      ['screening', 'reviewing'].includes(c.status)
    ).length

    return {
      id: pos.id,
      title: pos.title,
      count: posCandidates.length,
      avgScore: posAvgScore,
      topCandidate: topCandidate
        ? { name: topCandidate.name ?? '名前未取得', score: topCandidate.score! }
        : null,
      unprocessed,
    }
  })

  // ポジション未設定の候補者もカウント
  const noPositionCandidates = candidates.filter((c) => c.position_id == null)

  const SUMMARY_CARDS = [
    {
      label: '総候補者数',
      value: totalCandidates,
      unit: '人',
      icon: Users,
      color: 'text-[#00A896]',
      bg: 'bg-[#E6F5F3]',
    },
    {
      label: '今週の新規',
      value: thisWeekNew,
      unit: '人',
      icon: CalendarPlus,
      color: 'text-[#3B82F6]',
      bg: 'bg-blue-50',
    },
    {
      label: '平均スコア',
      value: avgScore ?? '—',
      unit: avgScore != null ? '点' : '',
      icon: TrendingUp,
      color: 'text-[#D97706]',
      bg: 'bg-amber-50',
    },
    {
      label: '面接調整中',
      value: interviewCount,
      unit: '人',
      icon: Mic,
      color: 'text-[#16A34A]',
      bg: 'bg-green-50',
    },
  ]

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <PageHeader
        title="ダッシュボード"
        description={`ようこそ、${session.user?.name ?? session.user?.email} さん`}
      />

      {/* Empty state */}
      {totalCandidates === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-full bg-[#E6F5F3] flex items-center justify-center">
            <Users size={28} className="text-[#00A896]" />
          </div>
          <div className="text-center">
            <p className="font-medium text-[#1C2B35]">まだ候補者がいません</p>
            <p className="mt-1 text-sm text-[#6B7F7C]">
              書類をアップロードして採用活動を始めましょう
            </p>
          </div>
          <Link href="/candidates/upload">
            <Button>
              <Upload size={16} />
              書類をアップロード
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {SUMMARY_CARDS.map(({ label, value, unit, icon: Icon, color, bg }) => (
              <Card key={label} padding="md">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-[#6B7F7C]">{label}</p>
                    <p className="mt-1.5 text-2xl md:text-3xl font-bold text-[#1C2B35]">
                      {value}
                      <span className="text-base font-medium text-[#6B7F7C] ml-0.5">{unit}</span>
                    </p>
                  </div>
                  <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={16} className={color} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card padding="md">
              <h2 className="font-semibold text-[#1C2B35] mb-4">ステータス別 候補者数</h2>
              <StatusBarChart data={statusCounts} />
            </Card>
            <Card padding="md">
              <h2 className="font-semibold text-[#1C2B35] mb-4">スコア分布</h2>
              <ScoreDistributionChart data={scoreDist} />
            </Card>
          </div>

          {/* Position summary table */}
          {positions.length > 0 && (
            <Card padding="none">
              <div className="p-5 border-b border-[#F4F6F5]">
                <h2 className="font-semibold text-[#1C2B35]">ポジション別サマリ</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F4F6F5]">
                      <th className="text-left px-5 py-3 text-xs font-medium text-[#6B7F7C]">ポジション</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-[#6B7F7C]">応募者数</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-[#6B7F7C]">平均スコア</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7F7C]">最高スコア候補者</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-[#6B7F7C]">未処理</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positionSummary.map((pos, i) => (
                      <tr
                        key={pos.id}
                        className={`${i < positionSummary.length - 1 ? 'border-b border-[#F4F6F5]' : ''} hover:bg-[#F9F8F6] transition-colors`}
                      >
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/positions/${pos.id}`}
                            className="font-medium text-[#1C2B35] hover:text-[#00A896] transition-colors"
                          >
                            {pos.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-right text-[#1C2B35]">{pos.count}人</td>
                        <td className="px-4 py-3.5 text-right">
                          {pos.avgScore != null ? (
                            <span
                              className={`font-semibold ${
                                pos.avgScore >= 75
                                  ? 'text-[#00A896]'
                                  : pos.avgScore >= 50
                                  ? 'text-[#D97706]'
                                  : 'text-[#DC2626]'
                              }`}
                            >
                              {pos.avgScore}点
                            </span>
                          ) : (
                            <span className="text-[#6B7F7C]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {pos.topCandidate ? (
                            <span className="text-[#1C2B35]">
                              {pos.topCandidate.name}
                              <span className="ml-1.5 text-xs text-[#6B7F7C]">
                                ({pos.topCandidate.score}点)
                              </span>
                            </span>
                          ) : (
                            <span className="text-[#6B7F7C]">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {pos.unprocessed > 0 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#E6F5F3] text-xs font-semibold text-[#00A896]">
                              {pos.unprocessed}
                            </span>
                          ) : (
                            <span className="text-[#6B7F7C]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {noPositionCandidates.length > 0 && (
                      <tr className="border-t border-[#F4F6F5] hover:bg-[#F9F8F6] transition-colors">
                        <td className="px-5 py-3.5 text-[#6B7F7C] italic">ポジション未設定</td>
                        <td className="px-4 py-3.5 text-right text-[#1C2B35]">{noPositionCandidates.length}人</td>
                        <td className="px-4 py-3.5 text-right text-[#6B7F7C]">—</td>
                        <td className="px-4 py-3.5 text-[#6B7F7C]">—</td>
                        <td className="px-5 py-3.5 text-right text-[#6B7F7C]">—</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

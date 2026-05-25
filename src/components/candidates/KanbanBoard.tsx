'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'
import { CandidateCard, type CandidateForCard } from './CandidateCard'
import type { CandidateStatus } from '@/src/types/database'

const COLUMNS: { status: CandidateStatus; label: string; headerColor: string }[] = [
  { status: 'screening', label: '書類選考', headerColor: 'bg-[#E6F5F3] text-[#00A896]' },
  { status: 'reviewing', label: 'レビュー中', headerColor: 'bg-blue-50 text-blue-700' },
  { status: 'interview', label: '面接中', headerColor: 'bg-amber-50 text-amber-700' },
  { status: 'offered', label: '内定', headerColor: 'bg-green-50 text-green-700' },
  { status: 'rejected', label: '不採用', headerColor: 'bg-red-50 text-red-700' },
  { status: 'withdrawn', label: '辞退', headerColor: 'bg-[#F4F6F5] text-[#6B7F7C]' },
]

type Position = { id: string; title: string }

type KanbanBoardProps = {
  candidates: CandidateForCard[]
  positions: Position[]
}

export function KanbanBoard({ candidates, positions }: KanbanBoardProps) {
  const [positionFilter, setPositionFilter] = useState('all')
  const [sortHighScore, setSortHighScore] = useState(false)

  const filtered = candidates
    .filter((c) => positionFilter === 'all' || c.position?.id === positionFilter)
    .sort((a, b) => {
      if (!sortHighScore) return 0
      return (b.score ?? 0) - (a.score ?? 0)
    })

  return (
    <div className="flex flex-col gap-4">
      {/* フィルタバー */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="text-sm px-3 py-2 rounded-[10px] border border-[#D0D8D6] bg-white text-[#1C2B35] focus:border-[#00A896] focus:ring-1 focus:ring-[#00A896] outline-none"
        >
          <option value="all">すべてのポジション</option>
          {positions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-[#1C2B35] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sortHighScore}
            onChange={(e) => setSortHighScore(e.target.checked)}
            className="accent-[#00A896] w-4 h-4"
          />
          スコア高順
        </label>

        <span className="text-sm text-[#6B7F7C]">{filtered.length} 名</span>
      </div>

      {/* カンバンボード（横スクロール） */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
          {COLUMNS.map(({ status, label, headerColor }) => {
            const cards = filtered.filter((c) => c.status === status)

            return (
              <div key={status} className="flex flex-col gap-3 w-[260px]">
                {/* 列ヘッダー */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${headerColor}`}>
                    {label}
                  </span>
                  <span className="text-xs text-[#6B7F7C] font-medium">{cards.length}</span>
                </div>

                {/* カード列 */}
                <div className="flex flex-col gap-2 min-h-[120px]">
                  {cards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 rounded-[10px] border border-dashed border-[#D0D8D6] bg-[#F9F8F6]">
                      <Users size={20} className="text-[#D0D8D6]" />
                      <p className="text-xs text-[#6B7F7C]">該当なし</p>
                    </div>
                  ) : (
                    cards.map((candidate) => (
                      <CandidateCard key={candidate.id} candidate={candidate} />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

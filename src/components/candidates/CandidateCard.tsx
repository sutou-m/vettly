'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { ArrowRight, UserX, UserMinus } from 'lucide-react'
import { ScoreBar } from '@/src/components/ui/ScoreBar'
import { updateCandidateStatus } from '@/src/lib/actions/candidates'
import type { CandidateStatus } from '@/src/types/database'

const NEXT_STATUS: Partial<Record<CandidateStatus, CandidateStatus>> = {
  screening: 'reviewing',
  reviewing: 'interview',
  interview: 'offered',
}

export type CandidateForCard = {
  id: string
  name: string | null
  score: number | null
  skills: string[] | null
  status: CandidateStatus
  created_at: string
  position: { id: string; title: string } | null
}

export function CandidateCard({ candidate }: { candidate: CandidateForCard }) {
  const [isPending, startTransition] = useTransition()

  const nextStatus = NEXT_STATUS[candidate.status]
  const canReject = ['screening', 'reviewing', 'interview'].includes(candidate.status)
  const displayName = candidate.name ?? '名前未取得'
  const skills = (candidate.skills ?? []).slice(0, 3)
  const score = candidate.score ?? 0
  const date = new Date(candidate.created_at).toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
  })

  function handleStatus(status: CandidateStatus, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    startTransition(async () => {
      await updateCandidateStatus(candidate.id, status)
    })
  }

  return (
    <div
      className={`bg-white rounded-[10px] border border-[#D0D8D6] p-4 flex flex-col gap-3 shadow-sm transition-opacity ${isPending ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm text-[#1C2B35] leading-snug">{displayName}</p>
        <span className="text-xs text-[#6B7F7C] shrink-0">{date}</span>
      </div>

      {candidate.position && (
        <p className="text-xs text-[#6B7F7C] truncate">{candidate.position.title}</p>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-xs text-[#6B7F7C]">AIスコア</span>
        <ScoreBar score={score} />
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skills.map((skill) => (
            <span
              key={skill}
              className="text-xs bg-[#F4F6F5] text-[#6B7F7C] px-2 py-0.5 rounded-[6px]"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#F4F6F5]">
        <Link href={`/candidates/${candidate.id}`} className="text-xs text-[#00A896] hover:underline">
          詳細を見る
        </Link>

        <div className="ml-auto flex items-center gap-1 flex-wrap justify-end">
          {canReject && (
            <>
              <button
                onClick={() => handleStatus('rejected', `${displayName} を不採用にしますか？`)}
                disabled={isPending}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-[6px] bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                <UserX size={11} />
                不採用
              </button>
              <button
                onClick={() => handleStatus('withdrawn', `${displayName} を辞退として登録しますか？`)}
                disabled={isPending}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-[6px] bg-[#F4F6F5] text-[#6B7F7C] hover:bg-[#E8EEED] disabled:opacity-50 transition-colors"
              >
                <UserMinus size={11} />
                辞退
              </button>
            </>
          )}
          {nextStatus && (
            <button
              onClick={() => handleStatus(nextStatus)}
              disabled={isPending}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-[6px] bg-[#00A896] text-white hover:bg-[#008A7C] disabled:opacity-50 transition-colors"
            >
              次へ
              <ArrowRight size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

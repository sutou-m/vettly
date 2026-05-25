'use client'

import { useTransition } from 'react'
import { ArrowRight, UserX, UserMinus } from 'lucide-react'
import { StatusBadge } from '@/src/components/ui/StatusBadge'
import { Button } from '@/src/components/ui/Button'
import { updateCandidateStatus } from '@/src/lib/actions/candidates'
import type { CandidateStatus } from '@/src/types/database'

const NEXT_STATUS: Partial<Record<CandidateStatus, CandidateStatus>> = {
  screening: 'reviewing',
  reviewing: 'interview',
  interview: 'offered',
}

const NEXT_LABEL: Partial<Record<CandidateStatus, string>> = {
  screening: 'レビュー中へ',
  reviewing: '面接中へ',
  interview: '内定へ',
}

type Props = {
  candidateId: string
  candidateName: string
  currentStatus: CandidateStatus
}

export function CandidateDetailStatus({ candidateId, candidateName, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()

  const nextStatus = NEXT_STATUS[currentStatus]
  const nextLabel = NEXT_LABEL[currentStatus]
  const canReject = ['screening', 'reviewing', 'interview'].includes(currentStatus)

  function handleStatus(status: CandidateStatus, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    startTransition(async () => {
      await updateCandidateStatus(candidateId, status)
    })
  }

  return (
    <div className={`flex items-center gap-2 flex-wrap transition-opacity ${isPending ? 'opacity-50' : ''}`}>
      <StatusBadge status={currentStatus} />
      {canReject && (
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleStatus('rejected', `${candidateName} を不採用にしますか？`)}
            disabled={isPending}
          >
            <UserX size={14} />
            不採用
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatus('withdrawn', `${candidateName} を辞退として登録しますか？`)}
            disabled={isPending}
            className="text-[#6B7F7C] hover:bg-[#F4F6F5]"
          >
            <UserMinus size={14} />
            辞退
          </Button>
        </>
      )}
      {nextStatus && nextLabel && (
        <Button
          size="sm"
          onClick={() => handleStatus(nextStatus)}
          disabled={isPending}
          loading={isPending}
        >
          {nextLabel}
          <ArrowRight size={14} />
        </Button>
      )}
    </div>
  )
}

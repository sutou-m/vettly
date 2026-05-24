type Status = 'screening' | 'reviewing' | 'interview' | 'offered' | 'rejected' | 'withdrawn'

const STATUS_LABEL: Record<Status, string> = {
  screening: '書類選考',
  reviewing: 'レビュー中',
  interview: '面接中',
  offered: '内定',
  rejected: '不採用',
  withdrawn: '辞退',
}

const STATUS_CLASSES: Record<Status, string> = {
  screening: 'bg-[#E6F5F3] text-[#00A896]',
  reviewing: 'bg-blue-50 text-blue-700',
  interview: 'bg-amber-50 text-amber-700',
  offered: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  withdrawn: 'bg-[#F4F6F5] text-[#6B7F7C]',
}

type StatusBadgeProps = {
  status: Status
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASSES[status]} ${className}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

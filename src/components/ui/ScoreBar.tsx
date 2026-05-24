type ScoreBarProps = {
  score: number
  showLabel?: boolean
  className?: string
}

function getBarColor(score: number): string {
  if (score >= 75) return 'bg-[#00A896]'
  if (score >= 50) return 'bg-[#D97706]'
  return 'bg-[#DC2626]'
}

function getTextColor(score: number): string {
  if (score >= 75) return 'text-[#00A896]'
  if (score >= 50) return 'text-[#D97706]'
  return 'text-[#DC2626]'
}

export function ScoreBar({ score, showLabel = true, className = '' }: ScoreBarProps) {
  const clamped = Math.min(100, Math.max(0, score))
  const barColor = getBarColor(clamped)
  const textColor = getTextColor(clamped)

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-2 bg-[#F4F6F5] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span className={`text-sm font-semibold w-10 text-right shrink-0 ${textColor}`}>
          {clamped}
        </span>
      )}
    </div>
  )
}

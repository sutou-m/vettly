import { HTMLAttributes } from 'react'

type Variant = 'primary' | 'success' | 'danger' | 'warning' | 'neutral'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[#E6F5F3] text-[#00A896]',
  success: 'bg-green-50 text-green-700',
  danger: 'bg-red-50 text-red-700',
  warning: 'bg-amber-50 text-amber-700',
  neutral: 'bg-[#F4F6F5] text-[#6B7F7C]',
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant
}

export function Badge({ variant = 'neutral', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

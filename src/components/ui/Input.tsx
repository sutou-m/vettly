import { InputHTMLAttributes, forwardRef } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className = '', id, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#1C2B35]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`w-full px-3 py-2 text-sm text-[#1C2B35] bg-white rounded-[6px] border transition-colors duration-150 outline-none placeholder:text-[#6B7F7C] focus:ring-1 ${
          error
            ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]'
            : 'border-[#D0D8D6] focus:border-[#00A896] focus:ring-[#00A896]'
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
      {hint && !error && <p className="text-xs text-[#6B7F7C]">{hint}</p>}
    </div>
  )
})

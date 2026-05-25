'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/src/components/ui/Button'
import { sendTestEmailAction } from '@/src/lib/actions/settings'
import { Mail } from 'lucide-react'

export function TestEmailButton({ adminEmail }: { adminEmail: string }) {
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    setResult(null)
    startTransition(async () => {
      const res = await sendTestEmailAction()
      setResult(res ?? null)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={handleClick} loading={isPending}>
          <Mail size={15} />
          テストメールを送信
        </Button>
        <span className="text-sm text-[#6B7F7C]">送信先: {adminEmail}</span>
      </div>
      {result?.error && (
        <p className="text-sm text-[#DC2626] bg-red-50 px-3 py-2 rounded-[6px]">{result.error}</p>
      )}
      {result?.success && (
        <p className="text-sm text-[#16A34A] bg-green-50 px-3 py-2 rounded-[6px]">{result.success}</p>
      )}
    </div>
  )
}

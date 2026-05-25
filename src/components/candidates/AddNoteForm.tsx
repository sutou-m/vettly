'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/src/components/ui/Button'
import { addCandidateNote } from '@/src/lib/actions/candidates'

export function AddNoteForm({ candidateId }: { candidateId: string }) {
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await addCandidateNote(candidateId, content.trim())
      if (result?.error) {
        setError(result.error)
      } else {
        setContent('')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="メモを追加..."
        rows={3}
        className="w-full px-3 py-2 text-sm text-[#1C2B35] placeholder:text-[#6B7F7C] bg-white rounded-[8px] border border-[#D0D8D6] focus:border-[#00A896] focus:ring-1 focus:ring-[#00A896] outline-none resize-none"
      />
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={!content.trim()} loading={isPending}>
          追加
        </Button>
      </div>
    </form>
  )
}

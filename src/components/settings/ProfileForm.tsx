'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/src/lib/actions/settings'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'

export function ProfileForm({ initialName }: { initialName: string }) {
  const [state, action, pending] = useActionState(updateProfile, undefined)

  return (
    <form action={action} className="flex flex-col gap-4 max-w-md">
      <Input
        label="名前"
        name="name"
        defaultValue={initialName}
        placeholder="例：山田 太郎"
        required
      />

      {state?.error && (
        <p className="text-sm text-[#DC2626] bg-red-50 px-3 py-2 rounded-[6px]">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-[#16A34A] bg-green-50 px-3 py-2 rounded-[6px]">{state.success}</p>
      )}

      <div>
        <Button type="submit" loading={pending}>
          保存
        </Button>
      </div>
    </form>
  )
}

'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/src/lib/actions/auth'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div className="w-full max-w-md px-4">
      <div className="bg-white rounded-[16px] border border-[#D0D8D6] shadow-sm p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#1C2B35]">Vettly</h1>
          <p className="mt-1 text-sm text-[#6B7F7C]">獣医師採用AIスクリーニング</p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <Input
            label="メールアドレス"
            type="email"
            name="email"
            placeholder="example@clinic.com"
            required
            autoComplete="email"
          />
          <Input
            label="パスワード"
            type="password"
            name="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          {state?.error && (
            <p className="text-sm text-[#DC2626] bg-red-50 px-3 py-2 rounded-[6px]">
              {state.error}
            </p>
          )}

          <Button type="submit" variant="primary" loading={pending} className="w-full mt-2">
            ログイン
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B7F7C]">
          アカウントをお持ちでない方は{' '}
          <Link href="/register" className="text-[#00A896] hover:underline font-medium">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}

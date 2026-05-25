'use server'

import { auth } from '@/src/lib/auth'
import { supabaseAdmin } from '@/src/lib/supabase'
import { revalidatePath } from 'next/cache'
import { sendTestEmail } from '@/src/lib/email'

type State = { error?: string; success?: string } | undefined

export async function updateProfile(prevState: State, formData: FormData): Promise<State> {
  const session = await auth()
  if (!session?.user?.id) return { error: '認証が必要です' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: '名前を入力してください' }

  const { error } = await supabaseAdmin
    .from('vet_users')
    .update({ name })
    .eq('id', session.user.id)

  if (error) return { error: 'プロフィールの更新に失敗しました' }

  revalidatePath('/settings')
  return { success: 'プロフィールを更新しました' }
}

export async function sendTestEmailAction(): Promise<State> {
  const session = await auth()
  if (!session?.user?.id) return { error: '認証が必要です' }

  const to = process.env.ADMIN_EMAIL
  if (!to) return { error: 'ADMIN_EMAIL が設定されていません' }

  try {
    await sendTestEmail({ userId: session.user.id })
    return { success: `テストメールを ${to} に送信しました` }
  } catch {
    return { error: 'メールの送信に失敗しました。RESEND_API_KEY を確認してください。' }
  }
}

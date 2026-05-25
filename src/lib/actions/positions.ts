'use server'

import { auth } from '@/src/lib/auth'
import { supabaseAdmin } from '@/src/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type PositionState = { error?: string } | undefined

function parseSkills(raw: string | null): string[] {
  if (!raw) return []
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

function parseEvalCriteria(formData: FormData) {
  return {
    required_skills: Number(formData.get('eval_required_skills')) || 40,
    experience: Number(formData.get('eval_experience')) || 30,
    preferred_skills: Number(formData.get('eval_preferred_skills')) || 20,
    motivation: Number(formData.get('eval_motivation')) || 10,
  }
}

export async function createPosition(
  prevState: PositionState,
  formData: FormData
): Promise<PositionState> {
  const session = await auth()
  if (!session?.user?.id) return { error: '認証が必要です' }

  const title = (formData.get('title') as string)?.trim()
  if (!title) return { error: 'ポジション名は必須です' }

  // セッションのuser_idがvet_usersに存在することを確認
  const { data: userRecord } = await supabaseAdmin
    .from('vet_users')
    .select('id')
    .eq('id', session.user.id)
    .single()

  if (!userRecord) {
    console.error('[createPosition] user not found in vet_users. session.user.id:', session.user.id)
    return {
      error: 'ユーザー情報が見つかりません。一度ログアウトして再登録してください。',
    }
  }

  const payload = {
    user_id: session.user.id,
    title,
    description: (formData.get('description') as string) || null,
    required_skills: parseSkills(formData.get('required_skills') as string),
    preferred_skills: parseSkills(formData.get('preferred_skills') as string),
    required_experience: Number(formData.get('required_experience')) || 0,
    evaluation_criteria: parseEvalCriteria(formData),
    is_active: formData.get('is_active') === 'true',
  }

  const { error } = await supabaseAdmin.from('vet_positions').insert(payload)

  if (error) {
    console.error('[createPosition] Supabase error:', JSON.stringify(error, null, 2))
    console.error('[createPosition] payload:', JSON.stringify(payload, null, 2))
    return { error: 'ポジションの作成に失敗しました' }
  }

  revalidatePath('/positions')
  redirect('/positions')
}

export async function updatePosition(
  id: string,
  prevState: PositionState,
  formData: FormData
): Promise<PositionState> {
  const session = await auth()
  if (!session?.user?.id) return { error: '認証が必要です' }

  const title = (formData.get('title') as string)?.trim()
  if (!title) return { error: 'ポジション名は必須です' }

  const { error } = await supabaseAdmin
    .from('vet_positions')
    .update({
      title,
      description: (formData.get('description') as string) || null,
      required_skills: parseSkills(formData.get('required_skills') as string),
      preferred_skills: parseSkills(formData.get('preferred_skills') as string),
      required_experience: Number(formData.get('required_experience')) || 0,
      evaluation_criteria: parseEvalCriteria(formData),
      is_active: formData.get('is_active') === 'true',
    })
    .eq('id', id)
    .eq('user_id', session.user.id)

  if (error) return { error: 'ポジションの更新に失敗しました' }

  revalidatePath('/positions')
  redirect('/positions')
}

export async function deletePosition(id: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return

  await supabaseAdmin
    .from('vet_positions')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id)

  revalidatePath('/positions')
  redirect('/positions')
}

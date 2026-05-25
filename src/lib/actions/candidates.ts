'use server'

import { auth } from '@/src/lib/auth'
import { supabaseAdmin } from '@/src/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { CandidateStatus } from '@/src/types/database'

export async function updateCandidateStatus(
  id: string,
  status: CandidateStatus
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: '認証が必要です' }

  const { error } = await supabaseAdmin
    .from('vet_candidates')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', session.user.id)

  if (error) return { error: 'ステータスの更新に失敗しました' }

  revalidatePath('/candidates')
  revalidatePath(`/candidates/${id}`)
  return {}
}

export async function addCandidateNote(
  candidateId: string,
  content: string
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: '認証が必要です' }

  if (!content.trim()) return { error: 'メモの内容を入力してください' }

  const { error } = await supabaseAdmin
    .from('vet_candidate_notes')
    .insert({ candidate_id: candidateId, user_id: session.user.id, content: content.trim() })

  if (error) return { error: 'メモの保存に失敗しました' }

  revalidatePath(`/candidates/${candidateId}`)
  return {}
}

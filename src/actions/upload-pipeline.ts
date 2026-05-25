'use server'

import { auth } from '@/src/lib/auth'
import { supabaseAdmin } from '@/src/lib/supabase'
import { runOcrOnDocument } from '@/src/lib/vision'
import { parseResume, type ParsedResume } from '@/src/lib/resume-parser'
import { scoreCandidate, type ScoreResult, type PositionInput } from '@/src/lib/scorer'
import { revalidatePath } from 'next/cache'
import type { Json } from '@/src/types/database'

export async function runOcrStep(documentId: string): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('認証が必要です')

  const { data: ownership } = await supabaseAdmin
    .from('vet_documents')
    .select('id')
    .eq('id', documentId)
    .eq('user_id', session.user.id)
    .single()
  if (!ownership) throw new Error('書類が見つかりません')

  await runOcrOnDocument(documentId)

  const { data: doc } = await supabaseAdmin
    .from('vet_documents')
    .select('ocr_raw_text, ocr_status')
    .eq('id', documentId)
    .single()

  if (doc?.ocr_status === 'error') throw new Error('OCR処理に失敗しました')

  return doc?.ocr_raw_text ?? ''
}

export async function runParseStep(ocrText: string): Promise<ParsedResume> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('認証が必要です')
  return parseResume(ocrText)
}

export async function runScoreStep(
  parsed: ParsedResume,
  position: PositionInput | null
): Promise<ScoreResult> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('認証が必要です')
  return scoreCandidate(parsed, position)
}

export type SaveCandidateParams = {
  documentId: string
  positionId: string | null
  name: string
  email: string | null
  phone: string | null
  education: string
  experience_years: number
  skills: string[]
  summary: string
  score: number
  score_breakdown: Json
}

export async function saveCandidateAction(
  params: SaveCandidateParams
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: '認証が必要です' }

  const { error } = await supabaseAdmin.from('vet_candidates').insert({
    user_id: session.user.id,
    document_id: params.documentId,
    position_id: params.positionId,
    name: params.name,
    email: params.email,
    phone: params.phone,
    education: params.education,
    experience_years: params.experience_years,
    skills: params.skills,
    summary: params.summary,
    score: params.score,
    score_breakdown: params.score_breakdown,
    status: 'screening',
    ai_processed: true,
  })

  if (error) return { error: '候補者の保存に失敗しました' }

  revalidatePath('/candidates')
  return {}
}

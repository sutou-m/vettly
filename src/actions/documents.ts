'use server'

import { auth } from '@/src/lib/auth'
import { supabaseAdmin } from '@/src/lib/supabase'
import { revalidatePath } from 'next/cache'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024

export type UploadResult = {
  documentId: string
  storagePath: string
}

export async function uploadDocument(formData: FormData): Promise<UploadResult> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('認証が必要です')

  const file = formData.get('file') as File
  if (!file || file.size === 0) throw new Error('ファイルが選択されていません')

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('対応していないファイル形式です（PDF・JPG・PNG・WebP）')
  }
  if (file.size > MAX_SIZE) {
    throw new Error('ファイルサイズは10MB以内にしてください')
  }

  const userId = session.user.id
  // ファイル名から英数字以外を _ に置換してStorage pathを安全に構築
  const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${userId}/${Date.now()}-${safeFilename}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: storageError } = await supabaseAdmin.storage
    .from('vet-documents')
    .upload(storagePath, buffer, { contentType: file.type })

  if (storageError) throw new Error('ファイルのアップロードに失敗しました')

  const { data: doc, error: dbError } = await supabaseAdmin
    .from('vet_documents')
    .insert({
      user_id: userId,
      storage_path: storagePath,
      original_filename: file.name,
      file_type: file.type,
      ocr_status: 'pending',
    })
    .select('id, storage_path')
    .single()

  if (dbError || !doc) {
    // DBエラー時はStorageのファイルを削除してロールバック
    await supabaseAdmin.storage.from('vet-documents').remove([storagePath])
    throw new Error('書類情報の保存に失敗しました')
  }

  revalidatePath('/candidates')

  return { documentId: doc.id, storagePath: doc.storage_path }
}

export async function deleteDocument(documentId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('認証が必要です')

  const { data: doc } = await supabaseAdmin
    .from('vet_documents')
    .select('storage_path')
    .eq('id', documentId)
    .eq('user_id', session.user.id)
    .single()

  if (!doc) return

  await Promise.all([
    supabaseAdmin.storage.from('vet-documents').remove([doc.storage_path]),
    supabaseAdmin.from('vet_documents').delete().eq('id', documentId).eq('user_id', session.user.id),
  ])

  revalidatePath('/candidates')
}

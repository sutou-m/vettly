import { supabaseAdmin } from '@/src/lib/supabase'

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate'

export async function extractTextFromDocument(
  base64Content: string,
  mimeType: string
): Promise<string> {
  const feature =
    mimeType === 'application/pdf'
      ? { type: 'DOCUMENT_TEXT_DETECTION' }
      : { type: 'TEXT_DETECTION' }

  const response = await fetch(
    `${VISION_API_URL}?key=${process.env.GOOGLE_CLOUD_VISION_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Content },
            features: [feature],
            imageContext: { languageHints: ['ja', 'en'] },
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Vision API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (data.responses?.[0]?.error) {
    throw new Error(`Vision API: ${data.responses[0].error.message}`)
  }

  return data.responses?.[0]?.fullTextAnnotation?.text ?? ''
}

export async function runOcrOnDocument(documentId: string): Promise<void> {
  // OCR処理中にステータスを更新
  await supabaseAdmin
    .from('vet_documents')
    .update({ ocr_status: 'processing' })
    .eq('id', documentId)

  try {
    const { data: doc } = await supabaseAdmin
      .from('vet_documents')
      .select('storage_path, file_type')
      .eq('id', documentId)
      .single()

    if (!doc) throw new Error('書類が見つかりません')

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('vet-documents')
      .download(doc.storage_path)

    if (downloadError || !fileData) throw new Error('ファイルのダウンロードに失敗しました')

    const buffer = Buffer.from(await fileData.arrayBuffer())
    const base64Content = buffer.toString('base64')

    const ocrText = await extractTextFromDocument(base64Content, doc.file_type ?? 'image/jpeg')

    await supabaseAdmin
      .from('vet_documents')
      .update({ ocr_raw_text: ocrText, ocr_status: 'done' })
      .eq('id', documentId)
  } catch {
    await supabaseAdmin
      .from('vet_documents')
      .update({ ocr_status: 'error' })
      .eq('id', documentId)
    throw new Error('OCR処理に失敗しました')
  }
}

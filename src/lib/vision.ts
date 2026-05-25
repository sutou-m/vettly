import { supabaseAdmin } from '@/src/lib/supabase'

const VISION_BASE = 'https://vision.googleapis.com/v1'

// PDF → files:annotate、画像 → images:annotate を使い分ける
export async function extractTextFromDocument(
  base64Content: string,
  mimeType: string
): Promise<string> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY
  if (!apiKey) throw new Error('GOOGLE_CLOUD_VISION_API_KEY が設定されていません')

  if (mimeType === 'application/pdf') {
    return extractFromPdf(base64Content, apiKey)
  }
  return extractFromImage(base64Content, apiKey)
}

async function extractFromPdf(base64Content: string, apiKey: string): Promise<string> {
  // PDFはfiles:annotateエンドポイントを使用（images:annotateはPDF非対応）
  const response = await fetch(`${VISION_BASE}/files:annotate?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          inputConfig: {
            content: base64Content,
            mimeType: 'application/pdf',
          },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          imageContext: { languageHints: ['ja', 'en'] },
          pages: [1, 2, 3, 4, 5],
        },
      ],
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    console.error('[Vision API] files:annotate HTTP error:', response.status, body)
    throw new Error(`Vision API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  console.log('[Vision API] files:annotate status:', response.status)

  if (data.responses?.[0]?.error) {
    console.error('[Vision API] files:annotate error:', JSON.stringify(data.responses[0].error))
    throw new Error(`Vision API: ${data.responses[0].error.message}`)
  }

  // files:annotateのレスポンス: responses[0].responses[n].fullTextAnnotation.text
  const pageResponses: Array<{ fullTextAnnotation?: { text?: string } }> =
    data.responses?.[0]?.responses ?? []

  return pageResponses
    .map((r) => r.fullTextAnnotation?.text ?? '')
    .join('\n')
    .trim()
}

async function extractFromImage(base64Content: string, apiKey: string): Promise<string> {
  const response = await fetch(`${VISION_BASE}/images:annotate?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          image: { content: base64Content },
          features: [{ type: 'TEXT_DETECTION' }],
          imageContext: { languageHints: ['ja', 'en'] },
        },
      ],
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    console.error('[Vision API] images:annotate HTTP error:', response.status, body)
    throw new Error(`Vision API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  console.log('[Vision API] images:annotate response keys:', Object.keys(data.responses?.[0] ?? {}))

  if (data.responses?.[0]?.error) {
    console.error('[Vision API] images:annotate error:', JSON.stringify(data.responses[0].error))
    throw new Error(`Vision API: ${data.responses[0].error.message}`)
  }

  return data.responses?.[0]?.fullTextAnnotation?.text ?? ''
}

export async function runOcrOnDocument(documentId: string): Promise<void> {
  await supabaseAdmin
    .from('vet_documents')
    .update({ ocr_status: 'processing' })
    .eq('id', documentId)

  try {
    // Step 1: メタデータ取得
    const { data: doc, error: docError } = await supabaseAdmin
      .from('vet_documents')
      .select('storage_path, file_type')
      .eq('id', documentId)
      .single()

    if (docError || !doc) {
      console.error('[OCR] vet_documents fetch failed:', docError)
      throw new Error('書類が見つかりません')
    }
    console.log('[OCR] doc:', { storage_path: doc.storage_path, file_type: doc.file_type })

    // Step 2: Storageからダウンロード
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('vet-documents')
      .download(doc.storage_path)

    if (downloadError || !fileData) {
      console.error('[OCR] Storage download failed:', downloadError)
      throw new Error('ファイルのダウンロードに失敗しました')
    }
    console.log('[OCR] downloaded. size:', fileData.size, 'type:', fileData.type)

    // Step 3: base64変換
    const buffer = Buffer.from(await fileData.arrayBuffer())
    const base64Content = buffer.toString('base64')
    const mimeType = doc.file_type ?? 'image/jpeg'
    console.log('[OCR] base64 length:', base64Content.length, 'mimeType:', mimeType)

    // Step 4: Vision API呼び出し（PDF/画像で自動切り替え）
    const ocrText = await extractTextFromDocument(base64Content, mimeType)
    console.log('[OCR] extracted text length:', ocrText.length)

    // Step 5: DB保存
    await supabaseAdmin
      .from('vet_documents')
      .update({ ocr_raw_text: ocrText, ocr_status: 'done' })
      .eq('id', documentId)
  } catch (err) {
    console.error('[OCR] runOcrOnDocument failed:', err)
    await supabaseAdmin
      .from('vet_documents')
      .update({ ocr_status: 'error' })
      .eq('id', documentId)
    throw new Error('OCR処理に失敗しました')
  }
}

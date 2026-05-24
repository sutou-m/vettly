# T-10 Google Cloud Vision API統合（OCRテキスト抽出）

## 担当エージェント
@ai-engineer @backend-architect

## 目的
アップロードされた応募書類（PDF/画像）からテキストを抽出する。

## 前提チケット
- T-09（Storage）完了済みであること

## 環境変数
```
GOOGLE_CLOUD_VISION_API_KEY=AIza...
```

## 完了条件
- [ ] `src/lib/vision.ts` が作成されている
- [ ] 画像からテキストが抽出できる
- [ ] PDFからテキストが抽出できる
- [ ] 抽出結果が `vet_documents.ocr_raw_text` に保存される
- [ ] APIエラー時に `ocr_status: 'error'` に更新される

## 実装内容

### Vision APIクライアント（`src/lib/vision.ts`）
```ts
export async function extractTextFromDocument(base64Content: string, mimeType: string): Promise<string> {
  const feature = mimeType === 'application/pdf'
    ? { type: 'DOCUMENT_TEXT_DETECTION' }  // PDF向け
    : { type: 'TEXT_DETECTION' }            // 画像向け

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_VISION_API_KEY}`,
    {
      method: 'POST',
      body: JSON.stringify({
        requests: [{
          image: { content: base64Content },
          features: [feature],
          imageContext: { languageHints: ['ja', 'en'] }  // 日本語・英語優先
        }]
      })
    }
  )
  const data = await response.json()
  return data.responses[0]?.fullTextAnnotation?.text ?? ''
}
```

## 注意事項
- 無料枠：月1,000リクエストまで
- APIキーはサーバーサイドのみ（`NEXT_PUBLIC_` 不要）
- PDFは `DOCUMENT_TEXT_DETECTION`、画像は `TEXT_DETECTION` を使い分ける

---
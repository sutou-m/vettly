# T-09 Supabase Storage設定・書類アップロード基盤

## 担当エージェント
@backend-architect

## 目的
応募書類（PDF・画像）のアップロード基盤を構築する。

## 前提チケット
- T-03完了済みであること

## 完了条件
- [ ] Supabase Storageに `vet-documents` バケットが作成されている（非公開）
- [ ] 画像・PDFアップロードのServer Actionが動作する
- [ ] アップロード上限が10MBに設定されている
- [ ] ファイルタイプバリデーション（PDF/JPG/PNG）が実装されている

## 実装内容

### next.config.tsの設定
```ts
export default {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}
```

### アップロードServer Action（`src/actions/documents.ts`）
```ts
'use server'
export async function uploadDocument(formData: FormData) {
  const file = formData.get('file') as File

  // バリデーション
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) throw new Error('対応していないファイル形式です')
  if (file.size > 10 * 1024 * 1024) throw new Error('ファイルサイズは10MB以内にしてください')

  const filename = `${userId}/${Date.now()}-${file.name}`

  const { data, error } = await supabaseAdmin.storage
    .from('vet-documents')
    .upload(filename, buffer, { contentType: file.type })

  // vet_documentsテーブルにメタデータ保存
}
```

## 注意事項
- バケット名は `vet-documents`（ハイフン区切り）
- KakeruのStorageバケット `kak-receipts` とは別
- `supabaseAdmin` はServer Actionのみで使用
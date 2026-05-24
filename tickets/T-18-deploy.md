# T-18 E2Eテスト・バグ修正・Vercelデプロイ

## 担当エージェント
@devops-automator

## 目的
全機能の結合テストを行い、本番デプロイ可能な状態にする。

## 完了条件
- [ ] 一連フローが動作する（登録→ログイン→ポジション作成→書類アップロード→AI処理→候補者確認）
- [ ] `npm run build` がエラーなく通る
- [ ] Vercelにデプロイされ本番URLでアクセスできる
- [ ] 環境変数がVercelに設定されている

## Vercelデプロイ時の環境変数
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://vettly.vercel.app（実際のURL）
NEXT_PUBLIC_APP_URL=https://vettly.vercel.app（実際のURL）
OPENAI_API_KEY=
GOOGLE_CLOUD_VISION_API_KEY=
RESEND_API_KEY=
ADMIN_EMAIL=
```

## チェックリスト
- [ ] ユーザー登録・ログイン・ログアウト
- [ ] ポジション作成・編集・削除
- [ ] 書類アップロード（PDF・画像）
- [ ] OCR処理（テキスト抽出）
- [ ] AI要約・スキル抽出
- [ ] AIスコアリング
- [ ] カンバンビュー・ステータス更新
- [ ] 候補者詳細・同一ポジションランキング
- [ ] ダッシュボードグラフ
- [ ] メール通知テスト
- [ ] モバイル表示確認
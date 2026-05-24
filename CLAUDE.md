@AGENTS.md

# CLAUDE.md

## Commands

```bash
npm run dev      # 開発サーバー起動 (localhost:3000)
npm run build    # ビルド（デプロイ前確認）
npm run lint     # ESLintチェック
```

No test runner is configured yet.

## Architecture

This is a Next.js 16 app using the **App Router** (not Pages Router).
Source lives under `app/`.

**Next.js version note:** This version may have breaking changes vs. training data.
Before writing routing, data-fetching, caching, or navigation code, read the
relevant guide in `node_modules/next/dist/docs/01-app/`.

Key differences from older Next.js:
- `middleware.ts` → `proxy.ts` (renamed in v16)
- Tailwind CSS v4: `tailwind.config.ts` は不使用。`@theme inline` でCSS変数をマッピング
- bcryptjs は Edge 分割不要でそのまま使用可能

## Tech Stack

- **Frontend:** Next.js 16 (App Router) / TypeScript / Tailwind CSS v4
- **Auth:** NextAuth.js (email + password)
- **Database:** Supabase (PostgreSQL) via `@supabase/supabase-js` — **Prismaは使用しない**
- **Storage:** Supabase Storage (応募書類) バケット名: `vet-documents`
- **OCR:** Google Cloud Vision API（月1,000回まで無料）
- **AI処理:** OpenAI GPT-4o（要約・スキル抽出・スコアリング）
- **Email:** Resend (`onboarding@resend.dev`)
- **Hosting:** Vercel

## Design Tokens

- Primary（ティール）: `#00A896`
- Primary Hover: `#008A7C`
- Primary Light: `#E6F5F3`
- Background（オフホワイト）: `#F9F8F6`
- Dark（スレート）: `#1C2B35`
- Muted: `#6B7F7C`
- Border: `#D0D8D6`
- Surface: `#FFFFFF`
- Danger: `#DC2626`
- Success: `#16A34A`
- Font: Noto Sans JP / system-ui

**重要ルール：**
- Tailwind組み込みの `gray-*` は**絶対に使用しない**
- ボタンの背景色はCSS変数ではなく**HEX値直書き**（デグレ防止）
  - 例: `className="bg-[#00A896] hover:bg-[#008A7C] text-white"`
- ミュートテキスト: `text-[#6B7F7C]`
- ボーダー: `border-[#D0D8D6]`

## Database Rules

- Prisma **不使用**（IPv4環境でTCP直接接続不可）
- テーブル名はすべて **`vet_`** プレフィックスをつける（既存Supabaseプロジェクト共有）
- テーブル作成・RLS設定は Supabase MCP または SQL Editor で行う
- RLSは全テーブルに必須設定
  - 認証ユーザーのみアクセス可: `authenticated` ロール + `user_id = auth.uid()`
- **日本語を含むINSERT文はClaude Code経由不可**
  - 理由: 文字コードの問題で `???` に化ける
  - 対処: Supabase管理画面の SQL Editor で直接実行すること

## Table Definitions

| テーブル名 | 概要 |
|-----------|------|
| vet_users | ユーザー情報（NextAuth連携） |
| vet_positions | 求人ポジション（必須スキル・評価軸） |
| vet_candidates | 候補者情報（AI抽出結果・スコア・ステータス） |
| vet_documents | 応募書類メタデータ（StorageパスOCRテキスト） |
| vet_candidate_notes | 候補者へのメモ・コメント |
| vet_notifications | メール通知ログ |

## Candidate Status Flow

```
screening → reviewing → interview → offered
                    ↘ rejected
                    ↘ withdrawn
```

| ステータス | 説明 |
|-----------|------|
| screening | AI スクリーニング待ち・処理中・完了 |
| reviewing | 担当者レビュー中 |
| interview | 面接調整・面接中 |
| offered | 内定 |
| rejected | 不採用 |
| withdrawn | 辞退 |

## AI Processing Flow

応募書類アップロード → OCR（Google Vision API）→ 要約・スキル抽出（GPT-4o）→ スコアリング（GPT-4o）→ DB保存

**スコアリングのウェイト:**
- 必須スキルの合致度: 40%
- 経験年数・業界経験: 30%
- 歓迎スキルの合致度: 20%
- 自己PR・意欲: 10%

## Route Groups

```
app/
  (public)/        # 公開ページ（ヘッダーのみ）
    page.tsx       # LP
  (auth)/          # 認証ページ（レイアウトなし）
    login/
    register/
  (app)/           # 認証後ページ（サイドバーあり）
    dashboard/
    candidates/
      [id]/
      upload/
    positions/
      [id]/
    settings/
```

## Known Issues & Fixes

- ボタンテキスト不可視 → CSS変数解決失敗 → HEX値で直指定
- 404エラー → App Routerフォルダ構成ズレ → ファイルパスを確認
- Supabase保存エラー → RLSポリシー未設定 → SQL Editorで追加
- 画像アップロードエラー → Server Action上限1MB → next.config.tsで10MBに拡張
- 日本語INSERT文字化け → Claude Code経由不可 → SQL Editorで直接実行
- 認証リダイレクト不具合 → proxy.ts のパス設定を確認（v16ではmiddleware.ts→proxy.ts）


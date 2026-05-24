# T-07 求人ポジション管理（一覧・作成・編集）

## 担当エージェント
@frontend-developer @backend-architect

## 目的
採用対象の求人ポジションを管理する機能を実装する。
ポジションはAIスコアリングの基準となる重要なマスタデータ。

## 前提チケット
- T-03・T-04・T-05完了済みであること

## 完了条件
- [ ] `/positions` にポジション一覧が表示される
- [ ] ポジションの新規作成・編集・削除ができる
- [ ] 必須スキル・歓迎スキルをタグ形式で入力できる
- [ ] アクティブ/非アクティブの切替ができる
- [ ] データ0件のEmpty Stateが表示される

## 実装内容

### 一覧ページ（`app/(app)/positions/page.tsx`）
- ポジションカード一覧
- 各カード：タイトル・必須スキルタグ・応募者数・アクティブバッジ・編集ボタン
- 右上：「+ 新規ポジション作成」ボタン

### 作成・編集フォーム（`app/(app)/positions/[id]/page.tsx`）

| フィールド | 入力方式 |
|-----------|---------|
| ポジション名 | text input |
| 業務内容 | textarea |
| 必須スキル | タグ入力（Enterで追加・×で削除） |
| 歓迎スキル | タグ入力 |
| 必要経験年数 | number input |
| 評価軸（jsonb） | 4項目固定（必須スキル/経験/歓迎スキル/自己PR）のウェイト設定 |
| アクティブ | toggle |

### Server Action（`src/actions/positions.ts`）
```ts
'use server'
export async function createPosition(formData: FormData) { ... }
export async function updatePosition(id: string, formData: FormData) { ... }
export async function deletePosition(id: string) { ... }
```

## テーブル
- `vet_positions`（vet_プレフィックス必須）

---
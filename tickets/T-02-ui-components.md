# T-02 共通UIコンポーネント

## 担当エージェント
@ui-designer @frontend-developer

## 目的
アプリ全体で使い回す基本UIパーツを作成する。
企業向けSaaSらしいスタイリッシュなデザインを実現する。

## 前提チケット
- T-01（デザインシステム）完了済みであること

## 完了条件
- [ ] `src/components/ui/` 以下に全コンポーネントが作成されている
- [ ] 全コンポーネントがTypeScriptで型定義されている
- [ ] ボタンのテキストが正しく表示される（不可視バグなし）
- [ ] `npm run build` がエラーなく通る

## 実装内容

### ディレクトリ構成
```
src/
  components/
    ui/
      Button.tsx
      Input.tsx
      Card.tsx
      Badge.tsx
      Spinner.tsx
      PageHeader.tsx
      ScoreBar.tsx      ← Vettly固有：スコア表示バー
      StatusBadge.tsx   ← Vettly固有：選考ステータスバッジ
```

### Button.tsx
variant: `primary` / `secondary` / `danger` / `ghost`
**背景色はHEX直書き**

```tsx
// primary:   bg-[#00A896] hover:bg-[#008A7C] text-white
// secondary: bg-white text-[#1C2B35] border border-[#D0D8D6] hover:bg-[#F4F6F5]
// danger:    bg-[#DC2626] hover:bg-[#B91C1C] text-white
// ghost:     bg-transparent text-[#00A896] hover:bg-[#E6F5F3]
```

### Badge.tsx
variant: `primary` / `success` / `danger` / `warning` / `neutral`

```tsx
// primary: bg-[#E6F5F3] text-[#00A896]
// success: bg-green-50 text-green-700  ※successのみ例外的にgreen使用可
// neutral: bg-[#F4F6F5] text-[#6B7F7C]
```

### StatusBadge.tsx（Vettly固有）
選考ステータスを色分けバッジで表示する。

```tsx
type Status = 'screening' | 'reviewing' | 'interview' | 'offered' | 'rejected' | 'withdrawn'

// screening:  bg-[#E6F5F3] text-[#00A896]  ティール
// reviewing:  bg-blue-50   text-blue-700
// interview:  bg-amber-50  text-amber-700
// offered:    bg-green-50  text-green-700
// rejected:   bg-red-50    text-red-700
// withdrawn:  bg-[#F4F6F5] text-[#6B7F7C]

const STATUS_LABEL: Record<Status, string> = {
  screening: '書類選考',
  reviewing: 'レビュー中',
  interview: '面接中',
  offered: '内定',
  rejected: '不採用',
  withdrawn: '辞退',
}
```

### ScoreBar.tsx（Vettly固有）
AIスコア（0〜100）を視覚的に表示するプログレスバー。

```tsx
type ScoreBarProps = {
  score: number  // 0〜100
  showLabel?: boolean
}

// 0〜49:  bg-[#DC2626]（赤）
// 50〜74: bg-[#D97706]（オレンジ）
// 75〜100: bg-[#00A896]（ティール）
```

### Input.tsx
```tsx
// border: border-[#D0D8D6]
// focus: focus:border-[#00A896] focus:ring-1 focus:ring-[#00A896]
// error: border-[#DC2626]
```

## 注意事項
- `gray-*` は**絶対に使用しない**（StatusBadge・ScoreBarのsuccess/blue/amber/redは例外）
- ミュートテキストは `text-[#6B7F7C]`
- Server ComponentとClient Componentを適切に使い分ける
- インタラクションがある場合は `'use client'` を付ける

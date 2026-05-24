# T-01 デザインシステム（CSS変数・トークン定義）

## 担当エージェント
@ui-designer

## 目的
VettlyのブランドカラーSlate×Tealを Tailwind CSS v4の `@theme inline` で定義し、
全コンポーネントで一貫したデザインを実現する基盤を構築する。

## 完了条件
- [ ] `app/globals.css` にVettlyデザイントークンが定義されている
- [ ] `@theme inline` でTailwindユーティリティにマッピングされている
- [ ] Tailwind組み込みの `gray-*` を使用していない
- [ ] `app/layout.tsx` にNoto Sans JPが設定されている
- [ ] `npm run dev` が正常起動する

## 実装内容

### 1. デザイントークン定義（`app/globals.css`）

```css
@theme inline {
  --color-primary: #00A896;
  --color-primary-hover: #008A7C;
  --color-primary-light: #E6F5F3;

  --color-bg: #F9F8F6;
  --color-surface: #FFFFFF;
  --color-surface-secondary: #F4F6F5;

  --color-dark: #1C2B35;
  --color-muted: #6B7F7C;
  --color-border: #D0D8D6;

  --color-success: #16A34A;
  --color-danger: #DC2626;
  --color-warning: #D97706;

  --font-sans: 'Noto Sans JP', system-ui, sans-serif;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
}

body {
  background-color: #F9F8F6;
  color: #1C2B35;
  font-family: var(--font-sans);
}
```

### 2. フォント設定（`app/layout.tsx`）

```tsx
import { Noto_Sans_JP } from 'next/font/google'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-sans',
})
```

## 注意事項
- `tailwind.config.ts` は**使用しない**（Tailwind CSS v4のため）
- `gray-50` `gray-100` 等は**絶対に使用しない**
- ボタンの背景色はCSS変数ではなく**HEX値直書き**
  - 例: `bg-[#00A896] hover:bg-[#008A7C]`

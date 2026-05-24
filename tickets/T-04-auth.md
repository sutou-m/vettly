# T-04 NextAuth認証（ログイン・新規登録・セッション管理）

## 担当エージェント
@backend-architect @frontend-developer

## 目的
NextAuth.jsでメール＋パスワード認証を実装する。
未認証ユーザーは `/login` にリダイレクトされるよう保護する。

## 前提チケット
- T-03（Supabase）完了済みであること

## 完了条件
- [x] `/login` でログインができる
- [x] `/register` で新規登録ができる
- [x] 未認証で `/dashboard` にアクセスすると `/login` にリダイレクトされる
- [x] ログアウトが動作する
- [x] セッションからuser_idが取得できる

## 実装内容

### 環境変数（`.env.local`）
```
NEXTAUTH_SECRET=（openssl rand -base64 32 で生成）
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### パッケージ
```bash
npm install next-auth bcryptjs
npm install -D @types/bcryptjs
```

### NextAuth設定（`src/lib/auth.ts`）
CredentialsProvider + bcryptjs でハッシュ化。

### ルートハンドラ（`app/api/auth/[...nextauth]/route.ts`）
```ts
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

### 認証保護（`proxy.ts`）
※ Next.js 16では `middleware.ts` → `proxy.ts` にリネーム

```ts
// 未認証ユーザーを /login にリダイレクト
// /login・/register・/ は除外
```

### ページ
- `/login`：メール・パスワード入力フォーム
- `/register`：名前・メール・パスワード入力フォーム（bcryptハッシュ化してvet_usersに保存）

## 注意事項
- パスワードは必ずbcryptハッシュ化して保存
- `supabaseAdmin` はServer Actionのみで使用
- Next.js 16では `proxy.ts`（`middleware.ts`ではない）

---
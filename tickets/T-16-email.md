# T-16 Resendメール通知（新規応募・処理完了）

## 担当エージェント
@backend-architect

## 目的
新規書類アップロード時とAI処理完了時にメール通知を送信する。

## 環境変数
```
RESEND_API_KEY=re_...
ADMIN_EMAIL=（Resendに登録したメールアドレス）
```

## 完了条件
- [ ] テストメールが送信できる
- [ ] AI処理完了通知メールが送信される
- [ ] 送信ログが `vet_notifications` に記録される

## 実装内容

```bash
npm install resend
```

### メールテンプレート（`src/lib/email.ts`）

```ts
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

// AI処理完了通知
export async function sendProcessingCompleteEmail(
  to: string,
  candidateName: string,
  score: number,
  positionTitle: string
) {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject: `【Vettly】${candidateName}さんのスクリーニングが完了しました`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <div style="background: #1C2B35; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #00A896; margin: 0;">Vettly</h1>
        </div>
        <div style="padding: 24px; background: #F9F8F6;">
          <p>${candidateName}さん（${positionTitle}）のAIスクリーニングが完了しました。</p>
          <p>マッチスコア：<strong style="color: #00A896; font-size: 24px;">${score}点</strong></p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/candidates"
             style="display: inline-block; background: #00A896; color: white;
                    padding: 12px 24px; border-radius: 6px; text-decoration: none;">
            候補者を確認する
          </a>
        </div>
      </div>
    `
  })
}
```

## 注意事項
- 送信先は開発環境ではADMIN_EMAILのみ（Resend制限）
- `vet_notifications` テーブルに送信ログを記録する

---
import { Resend } from 'resend'
import { supabaseAdmin } from '@/src/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'onboarding@resend.dev'

async function logNotification(
  userId: string,
  type: string,
  status: 'sent' | 'failed',
  candidateId?: string | null
) {
  await supabaseAdmin.from('vet_notifications').insert({
    user_id: userId,
    type,
    candidate_id: candidateId ?? null,
    status,
  })
}

export async function sendProcessingCompleteEmail(params: {
  userId: string
  candidateName: string
  score: number
  positionTitle: string
  candidateId?: string
}): Promise<void> {
  const to = process.env.ADMIN_EMAIL
  if (!to) {
    console.warn('[Email] ADMIN_EMAIL is not set — skipping')
    return
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const { userId, candidateName, score, positionTitle, candidateId } = params

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `【Vettly】${candidateName}さんのスクリーニングが完了しました`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1C2B35;padding:24px;border-radius:8px 8px 0 0;">
            <h1 style="color:#00A896;margin:0;font-size:22px;letter-spacing:-0.5px;">Vettly</h1>
          </div>
          <div style="padding:28px 24px;background:#F9F8F6;border-radius:0 0 8px 8px;border:1px solid #D0D8D6;border-top:none;">
            <p style="color:#1C2B35;margin:0 0 12px;font-size:15px;">
              <strong>${candidateName}</strong>さん（${positionTitle}）のAIスクリーニングが完了しました。
            </p>
            <p style="color:#1C2B35;margin:0 0 24px;font-size:15px;">
              マッチスコア：
              <strong style="color:#00A896;font-size:28px;margin-left:4px;">${score}点</strong>
            </p>
            <a href="${appUrl}/candidates"
               style="display:inline-block;background:#00A896;color:#ffffff;
                      padding:12px 24px;border-radius:6px;text-decoration:none;
                      font-weight:600;font-size:14px;">
              候補者を確認する
            </a>
            <p style="margin:24px 0 0;color:#6B7F7C;font-size:12px;">
              このメールはVettlyから自動送信されています。
            </p>
          </div>
        </div>
      `,
    })
    await logNotification(userId, 'processing_complete', 'sent', candidateId)
  } catch (err) {
    console.error('[Email] sendProcessingCompleteEmail failed:', err)
    await logNotification(userId, 'processing_complete', 'failed', candidateId)
  }
}

export async function sendTestEmail(params: {
  userId: string
}): Promise<void> {
  const to = process.env.ADMIN_EMAIL
  if (!to) throw new Error('ADMIN_EMAIL が設定されていません')

  const { userId } = params

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: '【Vettly】テストメールです',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1C2B35;padding:24px;border-radius:8px 8px 0 0;">
            <h1 style="color:#00A896;margin:0;font-size:22px;letter-spacing:-0.5px;">Vettly</h1>
          </div>
          <div style="padding:28px 24px;background:#F9F8F6;border-radius:0 0 8px 8px;border:1px solid #D0D8D6;border-top:none;">
            <p style="color:#1C2B35;margin:0 0 8px;font-size:15px;">
              メール通知が正常に設定されています。
            </p>
            <p style="color:#6B7F7C;margin:0;font-size:13px;">
              このメールはVettlyの設定画面から送信されたテストメールです。
            </p>
          </div>
        </div>
      `,
    })
    await logNotification(userId, 'test', 'sent')
  } catch (err) {
    console.error('[Email] sendTestEmail failed:', err)
    await logNotification(userId, 'test', 'failed')
    throw err
  }
}

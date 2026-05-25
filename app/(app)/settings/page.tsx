import { auth } from '@/src/lib/auth'
import { supabaseAdmin } from '@/src/lib/supabase'
import { PageHeader } from '@/src/components/ui/PageHeader'
import { Card } from '@/src/components/ui/Card'
import { ProfileForm } from '@/src/components/settings/ProfileForm'
import { TestEmailButton } from '@/src/components/settings/TestEmailButton'
import { User, Bell } from 'lucide-react'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const { data: user } = await supabaseAdmin
    .from('vet_users')
    .select('name, email')
    .eq('id', session.user.id)
    .single()

  const adminEmail = process.env.ADMIN_EMAIL ?? ''

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <PageHeader title="設定" description="プロフィールとメール通知の設定" />

      <div className="flex flex-col gap-6">
        {/* プロフィール */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-full bg-[#E6F5F3] flex items-center justify-center shrink-0">
              <User size={15} className="text-[#00A896]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#1C2B35]">プロフィール</h2>
              <p className="text-xs text-[#6B7F7C]">{user?.email}</p>
            </div>
          </div>
          <ProfileForm initialName={user?.name ?? ''} />
        </Card>

        {/* メール通知 */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-full bg-[#E6F5F3] flex items-center justify-center shrink-0">
              <Bell size={15} className="text-[#00A896]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#1C2B35]">メール通知</h2>
              <p className="text-xs text-[#6B7F7C]">AIスクリーニング完了時に通知が届きます</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 p-4 bg-[#F9F8F6] rounded-[10px]">
              <p className="text-xs font-medium text-[#6B7F7C]">通知トリガー</p>
              <ul className="text-sm text-[#1C2B35] flex flex-col gap-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A896] shrink-0" />
                  AIスクリーニング処理完了時
                </li>
              </ul>
            </div>

            {adminEmail ? (
              <TestEmailButton adminEmail={adminEmail} />
            ) : (
              <p className="text-sm text-[#DC2626] bg-red-50 px-3 py-2 rounded-[6px]">
                ADMIN_EMAIL が設定されていません。.env.local を確認してください。
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

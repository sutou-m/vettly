import { auth } from '@/src/lib/auth'
import { PageHeader } from '@/src/components/ui/PageHeader'
import { Card } from '@/src/components/ui/Card'

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="p-8">
      <PageHeader
        title="ダッシュボード"
        description={`ようこそ、${session?.user?.name ?? session?.user?.email} さん`}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-[#6B7F7C]">候補者総数</p>
          <p className="mt-1 text-3xl font-bold text-[#1C2B35]">0</p>
        </Card>
        <Card>
          <p className="text-sm text-[#6B7F7C]">スクリーニング中</p>
          <p className="mt-1 text-3xl font-bold text-[#1C2B35]">0</p>
        </Card>
        <Card>
          <p className="text-sm text-[#6B7F7C]">レビュー待ち</p>
          <p className="mt-1 text-3xl font-bold text-[#1C2B35]">0</p>
        </Card>
      </div>
    </div>
  )
}

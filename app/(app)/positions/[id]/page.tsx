import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { auth } from '@/src/lib/auth'
import { supabaseAdmin } from '@/src/lib/supabase'
import { PageHeader } from '@/src/components/ui/PageHeader'
import { Button } from '@/src/components/ui/Button'
import { PositionForm } from '@/src/components/positions/PositionForm'

export default async function PositionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return null

  const backButton = (
    <Link href="/positions">
      <Button variant="secondary" size="sm">
        <ChevronLeft size={16} />
        一覧に戻る
      </Button>
    </Link>
  )

  if (id === 'new') {
    return (
      <div className="p-4 md:p-8">
        <PageHeader title="新規ポジション作成" actions={backButton} />
        <PositionForm />
      </div>
    )
  }

  const { data: position } = await supabaseAdmin
    .from('vet_positions')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (!position) notFound()

  return (
    <div className="p-8">
      <PageHeader title="ポジション編集" actions={backButton} />
      <PositionForm position={position} />
    </div>
  )
}

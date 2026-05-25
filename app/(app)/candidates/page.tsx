import Link from 'next/link'
import { auth } from '@/src/lib/auth'
import { supabaseAdmin } from '@/src/lib/supabase'
import { PageHeader } from '@/src/components/ui/PageHeader'
import { KanbanBoard } from '@/src/components/candidates/KanbanBoard'
import { Button } from '@/src/components/ui/Button'
import { Users, Upload } from 'lucide-react'

export default async function CandidatesPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const [{ data: candidates }, { data: positions }] = await Promise.all([
    supabaseAdmin
      .from('vet_candidates')
      .select('id, name, score, skills, status, created_at, position_id')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('vet_positions')
      .select('id, title')
      .eq('user_id', session.user.id)
      .order('title'),
  ])

  const positionMap = new Map((positions ?? []).map((p) => [p.id, { id: p.id, title: p.title }]))

  const mapped = (candidates ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    score: c.score,
    skills: c.skills,
    status: c.status,
    created_at: c.created_at,
    position: c.position_id ? (positionMap.get(c.position_id) ?? null) : null,
  }))

  return (
    <div className="p-8">
      <PageHeader
        title="候補者管理"
        description="候補者をステータス別に管理します"
        actions={
          <Link href="/candidates/upload">
            <Button>
              <Upload size={16} />
              書類をアップロード
            </Button>
          </Link>
        }
      />

      {mapped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-full bg-[#E6F5F3] flex items-center justify-center">
            <Users size={28} className="text-[#00A896]" />
          </div>
          <div className="text-center">
            <p className="font-medium text-[#1C2B35]">候補者がいません</p>
            <p className="mt-1 text-sm text-[#6B7F7C]">
              書類をアップロードして候補者を追加してください
            </p>
          </div>
          <Link href="/candidates/upload">
            <Button>
              <Upload size={16} />
              書類をアップロード
            </Button>
          </Link>
        </div>
      ) : (
        <KanbanBoard candidates={mapped} positions={positions ?? []} />
      )}
    </div>
  )
}

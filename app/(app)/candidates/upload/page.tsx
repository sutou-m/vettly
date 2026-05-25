import Link from 'next/link'
import { auth } from '@/src/lib/auth'
import { supabaseAdmin } from '@/src/lib/supabase'
import { PageHeader } from '@/src/components/ui/PageHeader'
import { Button } from '@/src/components/ui/Button'
import { UploadFlow } from '@/src/components/candidates/UploadFlow'
import { ArrowLeft } from 'lucide-react'

export default async function CandidateUploadPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const { data: positions } = await supabaseAdmin
    .from('vet_positions')
    .select('id, title, required_skills, preferred_skills, required_experience, description')
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .order('title')

  const positionList = (positions ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    required_skills: p.required_skills ?? [],
    preferred_skills: p.preferred_skills ?? [],
    required_experience: p.required_experience,
    description: p.description,
  }))

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="書類アップロード"
        description="応募書類をアップロードしてAIが自動解析・スコアリングします"
        actions={
          <Link href="/candidates">
            <Button variant="secondary" size="sm">
              <ArrowLeft size={14} />
              候補者一覧へ
            </Button>
          </Link>
        }
      />
      <UploadFlow positions={positionList} />
    </div>
  )
}

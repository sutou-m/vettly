import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/src/lib/auth'
import { supabaseAdmin } from '@/src/lib/supabase'
import { PageHeader } from '@/src/components/ui/PageHeader'
import { Button } from '@/src/components/ui/Button'
import { ScoreBar } from '@/src/components/ui/ScoreBar'
import { CandidateDetailStatus } from '@/src/components/candidates/CandidateDetailStatus'
import { AddNoteForm } from '@/src/components/candidates/AddNoteForm'
import { ArrowLeft, Mail, Phone, GraduationCap, Briefcase, MessageSquare, Trophy, Trash2 } from 'lucide-react'
import { deleteCandidateNote } from '@/src/lib/actions/candidates'
import type { Json } from '@/src/types/database'

type ScoreBreakdown = {
  required_skills?: number
  experience?: number
  preferred_skills?: number
  motivation?: number
  strengths?: string[]
  concerns?: string[]
}

function parseBreakdown(raw: Json | null): ScoreBreakdown {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  return raw as ScoreBreakdown
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return null

  const [{ data: candidate }, { data: notes }] = await Promise.all([
    supabaseAdmin
      .from('vet_candidates')
      .select(`
        id, name, email, phone, education, experience_years,
        summary, skills, score, score_breakdown, status,
        created_at, position_id,
        vet_positions ( id, title )
      `)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single(),
    supabaseAdmin
      .from('vet_candidate_notes')
      .select('id, content, created_at')
      .eq('candidate_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!candidate) notFound()

  const displayName = candidate.name ?? '名前未取得'
  const score = candidate.score ?? 0
  const skills = candidate.skills ?? []
  const bd = parseBreakdown(candidate.score_breakdown)
  const position = Array.isArray(candidate.vet_positions)
    ? candidate.vet_positions[0]
    : candidate.vet_positions

  // ランキング：同じポジションの候補者（スコア降順）
  let ranking: { id: string; name: string | null; score: number | null }[] = []
  if (candidate.position_id) {
    const { data: ranked } = await supabaseAdmin
      .from('vet_candidates')
      .select('id, name, score')
      .eq('user_id', session.user.id)
      .eq('position_id', candidate.position_id)
      .not('score', 'is', null)
      .order('score', { ascending: false })
      .limit(10)
    ranking = ranked ?? []
  }

  const rankIndex = ranking.findIndex((r) => r.id === id)
  const rank = rankIndex >= 0 ? rankIndex + 1 : null

  const BREAKDOWN_ITEMS = [
    { label: '必須スキル合致度', value: bd.required_skills ?? 0, max: 40 },
    { label: '経験年数・業界経験', value: bd.experience ?? 0, max: 30 },
    { label: '歓迎スキル合致度', value: bd.preferred_skills ?? 0, max: 20 },
    { label: '自己PR・意欲', value: bd.motivation ?? 0, max: 10 },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <PageHeader
        title={displayName}
        description={position ? `応募ポジション：${position.title}` : undefined}
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/candidates">
              <Button variant="secondary" size="sm">
                <ArrowLeft size={14} />
                一覧へ戻る
              </Button>
            </Link>
            <CandidateDetailStatus
              candidateId={id}
              candidateName={displayName}
              currentStatus={candidate.status}
            />
          </div>
        }
      />

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left: Profile */}
        <div className="bg-white rounded-[16px] border border-[#D0D8D6] p-6 flex flex-col gap-5">
          <h2 className="font-semibold text-[#1C2B35]">プロフィール</h2>

          {skills.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-[#6B7F7C]">スキル</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center bg-[#E6F5F3] text-[#00A896] text-xs font-medium px-2 py-0.5 rounded-[6px]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {candidate.email && (
              <div className="flex items-center gap-2 text-sm text-[#1C2B35]">
                <Mail size={14} className="text-[#6B7F7C] shrink-0" />
                <span className="truncate">{candidate.email}</span>
              </div>
            )}
            {candidate.phone && (
              <div className="flex items-center gap-2 text-sm text-[#1C2B35]">
                <Phone size={14} className="text-[#6B7F7C] shrink-0" />
                <span>{candidate.phone}</span>
              </div>
            )}
            {candidate.education && (
              <div className="flex items-center gap-2 text-sm text-[#1C2B35]">
                <GraduationCap size={14} className="text-[#6B7F7C] shrink-0" />
                <span>{candidate.education}</span>
              </div>
            )}
            {candidate.experience_years != null && (
              <div className="flex items-center gap-2 text-sm text-[#1C2B35]">
                <Briefcase size={14} className="text-[#6B7F7C] shrink-0" />
                <span>経験 {candidate.experience_years} 年</span>
              </div>
            )}
          </div>

          {candidate.summary && (
            <div className="flex flex-col gap-2 pt-4 border-t border-[#F4F6F5]">
              <p className="text-xs font-medium text-[#6B7F7C]">職歴・自己PR要約</p>
              <p className="text-sm text-[#1C2B35] leading-relaxed whitespace-pre-wrap">
                {candidate.summary}
              </p>
            </div>
          )}
        </div>

        {/* Right: Score + Breakdown + Strengths/Concerns */}
        <div className="flex flex-col gap-4">
          {/* Score card */}
          <div className="bg-white rounded-[16px] border border-[#D0D8D6] p-6 flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-semibold text-[#1C2B35]">AIスコア</h2>
              <span className="text-3xl font-bold text-[#00A896]">{score}</span>
            </div>
            <ScoreBar score={score} showLabel={false} />
            <div className="flex flex-col gap-3 pt-2">
              {BREAKDOWN_ITEMS.map(({ label, value, max }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-[#6B7F7C] w-32 shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-[#F4F6F5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00A896] rounded-full"
                      style={{ width: `${(value / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-[#1C2B35] w-9 text-right shrink-0">
                    {value}/{max}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Concerns */}
          {((bd.strengths?.length ?? 0) > 0 || (bd.concerns?.length ?? 0) > 0) && (
            <div className="bg-white rounded-[16px] border border-[#D0D8D6] p-6 flex flex-col gap-4">
              <h2 className="font-semibold text-[#1C2B35]">AI分析（参考）</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {(bd.strengths?.length ?? 0) > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-[#00A896] uppercase tracking-wide">強み</p>
                    <ul className="flex flex-col gap-1.5">
                      {bd.strengths!.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#1C2B35]">
                          <span className="text-[#00A896] shrink-0 mt-0.5">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(bd.concerns?.length ?? 0) > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-[#DC2626] uppercase tracking-wide">懸念点</p>
                    <ul className="flex flex-col gap-1.5">
                      {bd.concerns!.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#1C2B35]">
                          <span className="text-[#DC2626] shrink-0 mt-0.5">•</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ranking */}
      {ranking.length > 1 && position && (
        <div className="bg-white rounded-[16px] border border-[#D0D8D6] p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-[#00A896]" />
            <h2 className="font-semibold text-[#1C2B35]">
              「{position.title}」の候補者ランキング
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {ranking.map((r, idx) => {
              const isSelf = r.id === id
              const rScore = r.score ?? 0
              return (
                <Link
                  key={r.id}
                  href={`/candidates/${r.id}`}
                  className={`flex items-center gap-3 p-3 rounded-[10px] transition-colors ${
                    isSelf
                      ? 'bg-[#E6F5F3] border border-[#00A896]'
                      : 'hover:bg-[#F9F8F6] border border-transparent'
                  }`}
                >
                  <span
                    className={`text-xs font-bold w-6 text-right shrink-0 ${
                      idx === 0
                        ? 'text-[#D97706]'
                        : idx === 1
                        ? 'text-[#6B7F7C]'
                        : idx === 2
                        ? 'text-[#92400E]'
                        : 'text-[#6B7F7C]'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className={`text-sm w-32 truncate shrink-0 ${isSelf ? 'font-semibold text-[#00A896]' : 'text-[#1C2B35]'}`}>
                    {r.name ?? '名前未取得'}
                    {isSelf && ' （本人）'}
                  </span>
                  <div className="flex-1 h-1.5 bg-[#F4F6F5] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isSelf ? 'bg-[#00A896]' : 'bg-[#D0D8D6]'}`}
                      style={{ width: `${rScore}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium w-8 text-right shrink-0 ${isSelf ? 'text-[#00A896]' : 'text-[#1C2B35]'}`}>
                    {rScore}
                  </span>
                </Link>
              )
            })}
          </div>
          {rank && (
            <p className="text-xs text-[#6B7F7C] mt-3 text-right">
              {ranking.length}人中 {rank}位
            </p>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="bg-white rounded-[16px] border border-[#D0D8D6] p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={16} className="text-[#00A896]" />
          <h2 className="font-semibold text-[#1C2B35]">メモ・コメント</h2>
        </div>

        {(notes ?? []).length > 0 && (
          <div className="flex flex-col gap-3 mb-4">
            {(notes ?? []).map((note) => (
              <div
                key={note.id}
                className="flex items-start gap-3 p-3 bg-[#F9F8F6] rounded-[10px] group"
              >
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <p className="text-sm text-[#1C2B35] whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-[#6B7F7C]">
                    {new Date(note.created_at).toLocaleString('ja-JP', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <form action={deleteCandidateNote.bind(null, note.id)}>
                  <button
                    type="submit"
                    title="削除"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-[6px] text-[#6B7F7C] hover:text-[#DC2626] hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        <AddNoteForm candidateId={id} />
      </div>
    </div>
  )
}

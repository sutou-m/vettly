'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, CheckCircle, AlertCircle, X, RotateCcw, Sparkles } from 'lucide-react'
import { Spinner } from '@/src/components/ui/Spinner'
import { ScoreBar } from '@/src/components/ui/ScoreBar'
import { Button } from '@/src/components/ui/Button'
import { uploadDocument } from '@/src/actions/documents'
import { runOcrStep, runParseStep, runScoreStep, saveCandidateAction } from '@/src/actions/upload-pipeline'
import type { ParsedResume } from '@/src/lib/resume-parser'
import type { ScoreResult, PositionInput } from '@/src/lib/scorer'

type Phase = 'select' | 'uploading' | 'ocr' | 'parse' | 'score' | 'confirm' | 'saving' | 'error'

export type PositionForUpload = {
  id: string
  title: string
  required_skills: string[]
  preferred_skills: string[]
  required_experience: number
  description: string | null
}

const STEPS: { phases: Phase[]; label: string; sub: string }[] = [
  { phases: ['uploading', 'ocr'], label: 'テキスト抽出', sub: 'OCR処理中...' },
  { phases: ['parse'], label: '書類解析', sub: 'AI解析中...' },
  { phases: ['score'], label: 'スコアリング', sub: 'マッチ度算出中...' },
]

function currentStepIndex(phase: Phase): number {
  return STEPS.findIndex((s) => s.phases.includes(phase))
}

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

export function UploadFlow({ positions }: { positions: PositionForUpload[] }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<Phase>('select')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [positionId, setPositionId] = useState('none')
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null)
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Confirm form state
  const [editName, setEditName] = useState('')
  const [editSkills, setEditSkills] = useState<string[]>([])
  const [editSummary, setEditSummary] = useState('')
  const [skillInput, setSkillInput] = useState('')

  function pickFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage('対応していないファイル形式です（PDF・JPG・PNG・WebP）')
      setPhase('error')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('ファイルサイズは10MB以内にしてください')
      setPhase('error')
      return
    }
    setSelectedFile(file)
    setPreviewUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : null)
  }

  async function handleProcess() {
    if (!selectedFile) return
    setErrorMessage(null)

    try {
      setPhase('uploading')
      const fd = new FormData()
      fd.append('file', selectedFile)
      const { documentId: docId } = await uploadDocument(fd)
      setDocumentId(docId)

      setPhase('ocr')
      const ocrText = await runOcrStep(docId)

      setPhase('parse')
      const parsed = await runParseStep(ocrText)
      setParsedResume(parsed)

      setPhase('score')
      const pos = positions.find((p) => p.id === positionId) ?? null
      const positionInput: PositionInput | null = pos
        ? {
            title: pos.title,
            required_skills: pos.required_skills,
            preferred_skills: pos.preferred_skills,
            required_experience: pos.required_experience,
            description: pos.description,
          }
        : null
      const scored = await runScoreStep(parsed, positionInput)
      setScoreResult(scored)

      setEditName(parsed.name)
      setEditSkills(parsed.skills)
      setEditSummary(parsed.summary)
      setPhase('confirm')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '処理中にエラーが発生しました')
      setPhase('error')
    }
  }

  async function handleSave() {
    if (!parsedResume || !scoreResult || !documentId) return
    setIsSaving(true)

    const result = await saveCandidateAction({
      documentId,
      positionId: positionId === 'none' ? null : positionId,
      name: editName,
      email: parsedResume.email,
      phone: parsedResume.phone,
      education: parsedResume.education,
      experience_years: parsedResume.experience_years,
      skills: editSkills,
      summary: editSummary,
      score: scoreResult.total,
      score_breakdown: {
        ...scoreResult.breakdown,
        strengths: scoreResult.strengths,
        concerns: scoreResult.concerns,
      },
    })

    if (result?.error) {
      setIsSaving(false)
      setErrorMessage(result.error)
      setPhase('error')
      return
    }

    router.push('/candidates')
  }

  function handleReset() {
    setPhase('select')
    setSelectedFile(null)
    setPreviewUrl(null)
    setPositionId('none')
    setDocumentId(null)
    setParsedResume(null)
    setScoreResult(null)
    setErrorMessage(null)
    setEditName('')
    setEditSkills([])
    setEditSummary('')
    setSkillInput('')
  }

  function addSkillTag() {
    const t = skillInput.trim()
    if (t && !editSkills.includes(t)) setEditSkills((prev) => [...prev, t])
    setSkillInput('')
  }

  const isProcessing = ['uploading', 'ocr', 'parse', 'score'].includes(phase)
  const stepIdx = currentStepIndex(phase)

  // ── Error ──────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center gap-6 py-20">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle size={28} className="text-[#DC2626]" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-[#1C2B35]">処理に失敗しました</p>
          <p className="mt-2 text-sm text-[#6B7F7C]">{errorMessage}</p>
        </div>
        <Button variant="secondary" onClick={handleReset}>
          <RotateCcw size={16} />
          やり直す
        </Button>
      </div>
    )
  }

  // ── Processing steps ────────────────────────────────────
  if (isProcessing) {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center gap-12 py-20">
        {/* Step indicator */}
        <div className="flex items-center">
          {STEPS.map((step, idx) => {
            const isDone = idx < stepIdx
            const isActive = idx === stepIdx
            return (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-[#00A896] text-white'
                        : isActive
                        ? 'bg-[#00A896] text-white ring-4 ring-[#E6F5F3]'
                        : 'bg-[#F4F6F5] text-[#6B7F7C]'
                    }`}
                  >
                    {isDone ? <CheckCircle size={16} /> : idx + 1}
                  </div>
                  <span
                    className={`text-xs whitespace-nowrap ${
                      isActive ? 'text-[#1C2B35] font-medium' : 'text-[#6B7F7C]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-20 h-0.5 mx-2 mb-5 transition-colors ${
                      idx < stepIdx ? 'bg-[#00A896]' : 'bg-[#D0D8D6]'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-[#6B7F7C]">
            {STEPS[stepIdx]?.sub ?? '処理中...'}
          </p>
        </div>
      </div>
    )
  }

  // ── Confirm ─────────────────────────────────────────────
  if (phase === 'confirm' && parsedResume && scoreResult) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-16">
        {/* Score */}
        <div className="bg-white rounded-[16px] border border-[#D0D8D6] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#00A896]" />
            <h2 className="font-semibold text-[#1C2B35]">AIスコア</h2>
          </div>
          <ScoreBar score={scoreResult.total} />
          <div className="flex flex-col gap-2.5">
            {[
              { label: '必須スキル合致度', value: scoreResult.breakdown.required_skills, max: 40 },
              { label: '経験年数・業界経験', value: scoreResult.breakdown.experience, max: 30 },
              { label: '歓迎スキル合致度', value: scoreResult.breakdown.preferred_skills, max: 20 },
              { label: '自己PR・意欲', value: scoreResult.breakdown.motivation, max: 10 },
            ].map(({ label, value, max }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-[#6B7F7C] w-36 shrink-0">{label}</span>
                <div className="flex-1 h-1.5 bg-[#F4F6F5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00A896] rounded-full"
                    style={{ width: `${(value / max) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-[#1C2B35] w-10 text-right shrink-0">
                  {value}/{max}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Editable profile */}
        <div className="bg-white rounded-[16px] border border-[#D0D8D6] p-6 flex flex-col gap-5">
          <h2 className="font-semibold text-[#1C2B35]">候補者プロフィール（編集可）</h2>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#1C2B35]">氏名</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 text-sm text-[#1C2B35] bg-white rounded-[6px] border border-[#D0D8D6] focus:border-[#00A896] focus:ring-1 focus:ring-[#00A896] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#1C2B35]">スキル</label>
            <div
              className="min-h-[42px] w-full px-3 py-2 bg-white rounded-[6px] border border-[#D0D8D6] focus-within:border-[#00A896] focus-within:ring-1 focus-within:ring-[#00A896] transition-colors flex flex-wrap gap-1.5 items-center cursor-text"
            >
              {editSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 bg-[#E6F5F3] text-[#00A896] text-xs font-medium px-2 py-0.5 rounded-[6px]"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => setEditSkills((prev) => prev.filter((s) => s !== skill))}
                    className="hover:text-[#008A7C] transition-colors"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addSkillTag() }
                  if (e.key === 'Backspace' && !skillInput && editSkills.length > 0) {
                    setEditSkills((prev) => prev.slice(0, -1))
                  }
                }}
                onBlur={() => { if (skillInput.trim()) addSkillTag() }}
                placeholder={editSkills.length === 0 ? 'スキルを入力（Enterで追加）' : ''}
                className="flex-1 min-w-[140px] text-sm text-[#1C2B35] placeholder:text-[#6B7F7C] outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#1C2B35]">職歴・自己PR要約</label>
            <textarea
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 text-sm text-[#1C2B35] bg-white rounded-[6px] border border-[#D0D8D6] focus:border-[#00A896] focus:ring-1 focus:ring-[#00A896] outline-none resize-y"
            />
          </div>

          {/* Read-only info */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#F4F6F5]">
            {parsedResume.email && (
              <div>
                <p className="text-xs text-[#6B7F7C]">メール</p>
                <p className="text-sm text-[#1C2B35] truncate">{parsedResume.email}</p>
              </div>
            )}
            {parsedResume.phone && (
              <div>
                <p className="text-xs text-[#6B7F7C]">電話</p>
                <p className="text-sm text-[#1C2B35]">{parsedResume.phone}</p>
              </div>
            )}
            {parsedResume.education && (
              <div>
                <p className="text-xs text-[#6B7F7C]">最終学歴</p>
                <p className="text-sm text-[#1C2B35]">{parsedResume.education}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-[#6B7F7C]">経験年数</p>
              <p className="text-sm text-[#1C2B35]">{parsedResume.experience_years} 年</p>
            </div>
          </div>
        </div>

        {/* Strengths & Concerns */}
        {(scoreResult.strengths.length > 0 || scoreResult.concerns.length > 0) && (
          <div className="bg-white rounded-[16px] border border-[#D0D8D6] p-6 flex flex-col gap-4">
            <h2 className="font-semibold text-[#1C2B35]">AI分析（参考）</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scoreResult.strengths.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-[#00A896] uppercase tracking-wide">強み</p>
                  <ul className="flex flex-col gap-1.5">
                    {scoreResult.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#1C2B35]">
                        <span className="text-[#00A896] shrink-0 mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {scoreResult.concerns.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-[#DC2626] uppercase tracking-wide">懸念点</p>
                  <ul className="flex flex-col gap-1.5">
                    {scoreResult.concerns.map((c, i) => (
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

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleReset}>
            <RotateCcw size={16} />
            やり直す
          </Button>
          <Button onClick={handleSave} loading={isSaving}>
            候補者として登録する
          </Button>
        </div>
      </div>
    )
  }

  // ── Select (default) ────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto flex flex-col gap-5">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        className="border-2 border-dashed border-[#D0D8D6] rounded-[16px] bg-white hover:border-[#00A896] hover:bg-[#F9F8F6] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A896]"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) pickFile(f) }}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f) }}
        />

        {selectedFile ? (
          <div className="p-8 flex flex-col items-center gap-3">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="プレビュー"
                className="max-h-48 rounded-[10px] object-contain"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#E6F5F3] flex items-center justify-center">
                <FileText size={28} className="text-[#00A896]" />
              </div>
            )}
            <div className="text-center">
              <p className="text-sm font-medium text-[#1C2B35]">{selectedFile.name}</p>
              <p className="text-xs text-[#6B7F7C] mt-0.5">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <p className="text-xs text-[#00A896]">クリックで変更</p>
          </div>
        ) : (
          <div className="p-14 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#E6F5F3] flex items-center justify-center">
              <Upload size={28} className="text-[#00A896]" />
            </div>
            <div className="text-center">
              <p className="font-medium text-[#1C2B35]">書類をアップロード</p>
              <p className="mt-1 text-sm text-[#6B7F7C]">クリックまたはドラッグ＆ドロップ</p>
              <p className="mt-1 text-xs text-[#6B7F7C]">PDF・JPG・PNG・WebP（最大10MB）</p>
            </div>
          </div>
        )}
      </div>

      {/* Position selector */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[#1C2B35]">対象ポジション（任意）</label>
        <select
          value={positionId}
          onChange={(e) => setPositionId(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-[10px] border border-[#D0D8D6] bg-white text-[#1C2B35] focus:border-[#00A896] focus:ring-1 focus:ring-[#00A896] outline-none"
        >
          <option value="none">ポジション未選択（汎用スコアリング）</option>
          {positions.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      <Button onClick={handleProcess} disabled={!selectedFile} size="lg" className="w-full">
        <Upload size={16} />
        アップロードして解析する
      </Button>
    </div>
  )
}

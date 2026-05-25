'use client'

import { useState, useActionState } from 'react'
import Link from 'next/link'
import { TagInput } from '@/src/components/ui/TagInput'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'
import {
  createPosition,
  updatePosition,
  deletePosition,
  type PositionState,
} from '@/src/lib/actions/positions'
import type { Database } from '@/src/types/database'

type Position = Database['public']['Tables']['vet_positions']['Row']

type EvalCriteria = {
  required_skills: number
  experience: number
  preferred_skills: number
  motivation: number
}

const DEFAULT_EVAL: EvalCriteria = {
  required_skills: 40,
  experience: 30,
  preferred_skills: 20,
  motivation: 10,
}

const evalFields: { name: string; label: string; key: keyof EvalCriteria }[] = [
  { name: 'eval_required_skills', label: '必須スキルの合致度', key: 'required_skills' },
  { name: 'eval_experience', label: '経験年数・業界経験', key: 'experience' },
  { name: 'eval_preferred_skills', label: '歓迎スキルの合致度', key: 'preferred_skills' },
  { name: 'eval_motivation', label: '自己PR・意欲', key: 'motivation' },
]

function ActiveToggle({ defaultActive }: { defaultActive: boolean }) {
  const [active, setActive] = useState(defaultActive)
  return (
    <>
      <input type="hidden" name="is_active" value={String(active)} />
      <button
        type="button"
        role="switch"
        aria-checked={active}
        onClick={() => setActive((prev) => !prev)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          active ? 'bg-[#00A896]' : 'bg-[#D0D8D6]'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            active ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </>
  )
}

export function PositionForm({ position }: { position?: Position }) {
  const serverAction = position
    ? (prevState: PositionState, fd: FormData) =>
        updatePosition(position.id, prevState, fd)
    : createPosition

  const [state, formAction, pending] = useActionState(serverAction, undefined)

  const evalCriteria = (position?.evaluation_criteria as EvalCriteria | null) ?? DEFAULT_EVAL

  return (
    <div className="max-w-2xl">
      <form action={formAction} className="flex flex-col gap-6">
        {state?.error && (
          <div className="px-4 py-3 bg-red-50 border border-[#DC2626] rounded-[10px] text-sm text-[#DC2626]">
            {state.error}
          </div>
        )}

        <Input
          name="title"
          label="ポジション名"
          required
          defaultValue={position?.title}
          placeholder="例：Webエンジニア（シニア）"
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1C2B35]">業務内容</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={position?.description ?? ''}
            placeholder="業務内容を入力してください"
            className="w-full px-3 py-2 text-sm text-[#1C2B35] bg-white rounded-[6px] border border-[#D0D8D6] placeholder:text-[#6B7F7C] focus:border-[#00A896] focus:ring-1 focus:ring-[#00A896] outline-none transition-colors resize-y"
          />
        </div>

        <TagInput
          name="required_skills"
          label="必須スキル"
          defaultTags={position?.required_skills ?? []}
          placeholder="例：TypeScript（Enterで追加）"
        />

        <TagInput
          name="preferred_skills"
          label="歓迎スキル"
          defaultTags={position?.preferred_skills ?? []}
          placeholder="例：チームリード経験（Enterで追加）"
        />

        <Input
          name="required_experience"
          label="必要経験年数（年）"
          type="number"
          min={0}
          max={50}
          defaultValue={String(position?.required_experience ?? 0)}
        />

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#1C2B35]">評価軸ウェイト（合計100%）</span>
          <div className="bg-[#F9F8F6] rounded-[10px] border border-[#D0D8D6] overflow-hidden">
            {evalFields.map(({ name, label, key }, i) => (
              <div
                key={name}
                className={`flex items-center justify-between px-4 py-3 ${
                  i < evalFields.length - 1 ? 'border-b border-[#D0D8D6]' : ''
                }`}
              >
                <span className="text-sm text-[#1C2B35]">{label}</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    name={name}
                    min={0}
                    max={100}
                    defaultValue={evalCriteria[key] ?? DEFAULT_EVAL[key]}
                    className="w-16 px-2 py-1 text-sm text-right text-[#1C2B35] bg-white border border-[#D0D8D6] rounded-[6px] focus:border-[#00A896] focus:ring-1 focus:ring-[#00A896] outline-none"
                  />
                  <span className="text-sm text-[#6B7F7C]">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-[#F9F8F6] rounded-[10px] border border-[#D0D8D6]">
          <div>
            <p className="text-sm font-medium text-[#1C2B35]">公開ステータス</p>
            <p className="text-xs text-[#6B7F7C]">公開中は候補者の応募を受け付けます</p>
          </div>
          <ActiveToggle defaultActive={position?.is_active ?? true} />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#D0D8D6]">
          <div className="flex gap-3">
            <Button type="submit" loading={pending}>
              {position ? '変更を保存' : 'ポジションを作成'}
            </Button>
            <Link href="/positions">
              <Button type="button" variant="secondary">
                キャンセル
              </Button>
            </Link>
          </div>
          {position && (
            <form
              action={deletePosition.bind(null, position.id)}
              onSubmit={(e) => {
                if (
                  !confirm(
                    'このポジションを削除しますか？この操作は取り消せません。'
                  )
                ) {
                  e.preventDefault()
                }
              }}
            >
              <Button type="submit" variant="danger" size="sm">
                削除
              </Button>
            </form>
          )}
        </div>
      </form>
    </div>
  )
}

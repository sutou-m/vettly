import type { ParsedResume } from '@/src/lib/resume-parser'

export type ScoreResult = {
  total: number
  breakdown: {
    required_skills: number
    experience: number
    preferred_skills: number
    motivation: number
  }
  strengths: string[]
  concerns: string[]
}

export type PositionInput = {
  title: string
  required_skills: string[]
  preferred_skills: string[]
  required_experience: number
  description: string | null
}

const SYSTEM_PROMPT = `あなたは採用スクリーニングのAIです。
候補者情報と求人情報を比較し、以下のウェイトで厳密にスコアリングしてください：

- required_skills（必須スキル合致度）: 0〜40点
- experience（経験年数・業界経験の合致度）: 0〜30点
- preferred_skills（歓迎スキル合致度）: 0〜20点
- motivation（自己PR・意欲・ポテンシャル）: 0〜10点

必ずJSONのみを返してください。

返却するJSONのスキーマ:
{
  "total": 合計点（0〜100の整数）,
  "breakdown": {
    "required_skills": 0〜40の整数,
    "experience": 0〜30の整数,
    "preferred_skills": 0〜20の整数,
    "motivation": 0〜10の整数
  },
  "strengths": ["強み1", "強み2", "強み3"],
  "concerns": ["懸念点1", "懸念点2"]
}`

const NO_POSITION_SYSTEM_PROMPT = `あなたは採用スクリーニングのAIです。
求人情報がないため、書類の汎用的な品質でスコアリングしてください：

- required_skills（スキルの多様性・専門性）: 0〜40点
- experience（経験年数・職歴の充実度）: 0〜30点
- preferred_skills（付加価値スキル・資格）: 0〜20点
- motivation（自己PR・意欲・ポテンシャル）: 0〜10点

必ずJSONのみを返してください。

返却するJSONのスキーマ:
{
  "total": 合計点（0〜100の整数）,
  "breakdown": {
    "required_skills": 0〜40の整数,
    "experience": 0〜30の整数,
    "preferred_skills": 0〜20の整数,
    "motivation": 0〜10の整数
  },
  "strengths": ["強み1", "強み2"],
  "concerns": ["懸念点1", "懸念点2"]
}`

async function callScorer(systemPrompt: string, userContent: string): Promise<ScoreResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      temperature: 0,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (data.error) {
    throw new Error(`OpenAI API: ${data.error.message}`)
  }

  const content: string = data.choices?.[0]?.message?.content
  if (!content) throw new Error('GPT-4oからの応答が空です')

  const parsed = JSON.parse(content) as ScoreResult

  const bd = parsed.breakdown ?? {}
  const requiredSkills = Math.min(40, Math.max(0, Number(bd.required_skills) || 0))
  const experience = Math.min(30, Math.max(0, Number(bd.experience) || 0))
  const preferredSkills = Math.min(20, Math.max(0, Number(bd.preferred_skills) || 0))
  const motivation = Math.min(10, Math.max(0, Number(bd.motivation) || 0))

  return {
    total: Math.min(100, Math.max(0, requiredSkills + experience + preferredSkills + motivation)),
    breakdown: {
      required_skills: requiredSkills,
      experience,
      preferred_skills: preferredSkills,
      motivation,
    },
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
  }
}

export async function scoreCandidate(
  candidate: ParsedResume,
  position: PositionInput | null
): Promise<ScoreResult> {
  if (!position) {
    return callScorer(
      NO_POSITION_SYSTEM_PROMPT,
      `候補者情報：${JSON.stringify(candidate)}`
    )
  }

  return callScorer(
    SYSTEM_PROMPT,
    `求人情報：${JSON.stringify(position)}\n\n候補者情報：${JSON.stringify(candidate)}`
  )
}

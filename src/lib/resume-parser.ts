export type ParsedResume = {
  name: string
  email: string | null
  phone: string | null
  education: string
  experience_years: number
  work_history: Array<{
    company: string
    period: string
    role: string
    description: string
  }>
  skills: string[]
  certifications: string[]
  languages: string[]
  summary: string
}

const SYSTEM_PROMPT = `あなたは採用書類の解析専門AIです。
履歴書・職務経歴書のテキストから情報を抽出し、必ずJSONのみを返してください。
不明な項目はnullまたは空配列としてください。
summaryは200字以内の日本語要約にしてください。

返却するJSONのスキーマ:
{
  "name": "氏名（文字列）",
  "email": "メールアドレスまたはnull",
  "phone": "電話番号またはnull",
  "education": "最終学歴（文字列）",
  "experience_years": "推定職務経験年数（数値）",
  "work_history": [
    { "company": "会社名", "period": "在籍期間", "role": "職種・役職", "description": "業務内容" }
  ],
  "skills": ["スキル1", "スキル2"],
  "certifications": ["資格1"],
  "languages": ["日本語", "英語"],
  "summary": "200字以内の自己PR・強み要約"
}`

export async function parseResume(ocrText: string): Promise<ParsedResume> {
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
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `以下の書類テキストを解析してください：\n\n${ocrText}`,
        },
      ],
      max_tokens: 2000,
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

  const parsed = JSON.parse(content) as ParsedResume

  return {
    name: parsed.name ?? '不明',
    email: parsed.email ?? null,
    phone: parsed.phone ?? null,
    education: parsed.education ?? '',
    experience_years: Number(parsed.experience_years) || 0,
    work_history: Array.isArray(parsed.work_history) ? parsed.work_history : [],
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
    languages: Array.isArray(parsed.languages) ? parsed.languages : [],
    summary: parsed.summary ?? '',
  }
}

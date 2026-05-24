# T-11 GPT-4o統合（要約・スキル抽出・JSON構造化）

## 担当エージェント
@ai-engineer

## 目的
OCRで抽出したテキストをGPT-4oで構造化し、候補者プロフィールのJSONを生成する。

## 前提チケット
- T-10完了済みであること

## 環境変数
```
OPENAI_API_KEY=sk-...
```

## 完了条件
- [ ] `src/lib/resume-parser.ts` が作成されている
- [ ] OCRテキストから構造化JSONが返ってくる
- [ ] 日本語・英語どちらの書類にも対応している

## 実装内容

### 書類パーサー（`src/lib/resume-parser.ts`）

```ts
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
  summary: string  // 200字以内の自己PR要約
}

export async function parseResume(ocrText: string): Promise<ParsedResume> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },  // JSON強制
      temperature: 0,
      messages: [{
        role: 'system',
        content: `あなたは採用書類の解析専門AIです。
履歴書・職務経歴書のテキストから情報を抽出し、必ずJSONのみを返してください。
不明な項目はnullまたは空配列としてください。
summaryは200字以内の日本語要約にしてください。`
      }, {
        role: 'user',
        content: `以下の書類テキストを解析してください：\n\n${ocrText}`
      }],
      max_tokens: 2000,
    })
  })
  const data = await response.json()
  const content = data.choices[0].message.content
  return JSON.parse(content)
}
```

---
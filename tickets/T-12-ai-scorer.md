# T-12 AIスコアリング（ポジションとのマッチ度算出）

## 担当エージェント
@ai-engineer

## 目的
候補者情報と求人ポジションの評価軸を照合し、0〜100点のスコアを算出する。

## 前提チケット
- T-11完了済みであること

## 完了条件
- [ ] `src/lib/scorer.ts` が作成されている
- [ ] スコアと評価軸別内訳（jsonb）が返ってくる
- [ ] ポジション情報がない場合でも基本スコアが算出される

## 実装内容

### スコアリング（`src/lib/scorer.ts`）

```ts
export type ScoreResult = {
  total: number  // 0〜100
  breakdown: {
    required_skills: number   // 必須スキル合致度 40%
    experience: number        // 経験年数・業界経験 30%
    preferred_skills: number  // 歓迎スキル合致度 20%
    motivation: number        // 自己PR・意欲 10%
  }
  strengths: string[]    // 強み（AI分析）
  concerns: string[]     // 懸念点（AI分析）
}

export async function scoreCandidate(
  candidate: ParsedResume,
  position: { title: string; required_skills: string[]; preferred_skills: string[]; required_experience: number; description: string }
): Promise<ScoreResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    // ...
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      temperature: 0,
      messages: [{
        role: 'system',
        content: `あなたは採用スクリーニングのAIです。
候補者情報と求人情報を比較し、以下のウェイトでスコアリングしてください：
- required_skills（必須スキル合致度）: 40点満点
- experience（経験年数・業界経験）: 30点満点
- preferred_skills（歓迎スキル合致度）: 20点満点
- motivation（自己PR・意欲）: 10点満点
必ずJSONのみを返してください。`
      }, {
        role: 'user',
        content: `求人：${JSON.stringify(position)}\n候補者：${JSON.stringify(candidate)}`
      }]
    })
  })
  // ...
}
```

---
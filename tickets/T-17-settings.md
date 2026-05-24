# T-17 設定画面・メモ機能

## 担当エージェント
@frontend-developer

## 目的
プロフィール編集と通知設定を実装する。
メモ機能はT-14と連携して動作する。

## 完了条件
- [ ] `/settings` でプロフィール（名前）を編集できる
- [ ] テストメールを送信できる
- [ ] メモの追加・削除が動作する（T-14と連携）

## 実装内容

### タブ構成
- プロフィール：名前の編集・保存
- メール通知：テスト送信ボタン・通知設定

### メモServer Action（`src/actions/notes.ts`）
```ts
'use server'
export async function addNote(candidateId: string, content: string) { ... }
export async function deleteNote(noteId: string) { ... }
```

---
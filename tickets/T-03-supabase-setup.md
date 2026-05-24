# T-03 Supabaseセットアップ・全テーブル作成・RLS設定

## 担当エージェント
@backend-architect

## 目的
既存SupabaseプロジェクトにVettly用テーブルを `vet_` プレフィックスで作成する。
全テーブルにRLSを設定しセキュアなデータアクセスを実現する。

## 前提条件
- 既存Supabaseプロジェクトの接続情報が `.env.local` に設定済み
- 既存テーブル（kak_* 等）には一切触れない

```.env.local
NEXT_PUBLIC_SUPABASE_URL=（既存と同じ）
NEXT_PUBLIC_SUPABASE_ANON_KEY=（既存と同じ）
SUPABASE_SERVICE_KEY=（既存と同じ）
```

## 完了条件
- [x] `src/lib/supabase.ts` にクライアントが作成されている
- [x] 全6テーブルが `vet_` プレフィックスで作成されている
- [x] 全テーブルにRLSポリシーが設定されている
- [x] `src/types/database.ts` に型定義が作成されている

## 実装内容

### 1. Supabaseクライアント（`src/lib/supabase.ts`）

```ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)
```

### 2. テーブル作成（Supabase MCPまたはSQL Editorで実行）

#### vet_users
```sql
create table vet_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  auth_password text not null,
  created_at timestamptz default now()
);
```

#### vet_positions（求人ポジション）
```sql
create table vet_positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references vet_users(id) on delete cascade not null,
  title text not null,
  description text,
  required_skills text[],
  preferred_skills text[],
  required_experience integer default 0,
  evaluation_criteria jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);
```

#### vet_documents（応募書類）
```sql
create table vet_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references vet_users(id) on delete cascade not null,
  storage_path text not null,
  original_filename text,
  file_type text,
  ocr_raw_text text,
  ocr_status text check (ocr_status in ('pending','processing','done','error')) default 'pending',
  created_at timestamptz default now()
);
```

#### vet_candidates（候補者）
```sql
create table vet_candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references vet_users(id) on delete cascade not null,
  position_id uuid references vet_positions(id) on delete set null,
  document_id uuid references vet_documents(id),
  name text,
  email text,
  phone text,
  summary text,
  skills text[],
  experience_years integer,
  education text,
  score integer check (score >= 0 and score <= 100),
  score_breakdown jsonb,
  status text check (status in ('screening','reviewing','interview','offered','rejected','withdrawn')) default 'screening',
  ai_processed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

#### vet_candidate_notes（メモ）
```sql
create table vet_candidate_notes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references vet_candidates(id) on delete cascade not null,
  user_id uuid references vet_users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);
```

#### vet_notifications（通知ログ）
```sql
create table vet_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references vet_users(id) on delete cascade not null,
  type text not null,
  candidate_id uuid references vet_candidates(id),
  sent_at timestamptz default now(),
  status text check (status in ('sent','failed')) default 'sent'
);
```

### 3. RLSポリシー設定

```sql
-- vet_users
alter table vet_users enable row level security;
create policy "自分のデータのみ" on vet_users for all using (auth.uid() = id);

-- vet_positions
alter table vet_positions enable row level security;
create policy "自分のポジションのみ" on vet_positions for all using (auth.uid() = user_id);

-- vet_documents
alter table vet_documents enable row level security;
create policy "自分の書類のみ" on vet_documents for all using (auth.uid() = user_id);

-- vet_candidates
alter table vet_candidates enable row level security;
create policy "自分の候補者のみ" on vet_candidates for all using (auth.uid() = user_id);

-- vet_candidate_notes
alter table vet_candidate_notes enable row level security;
create policy "自分のメモのみ" on vet_candidate_notes for all using (auth.uid() = user_id);

-- vet_notifications
alter table vet_notifications enable row level security;
create policy "自分の通知のみ" on vet_notifications for select using (auth.uid() = user_id);
```

### 4. Supabase Storage バケット作成
管理画面から手動で作成する：
- バケット名: `vet-documents`
- 公開設定: **非公開（Private）**
- Storage RLSポリシー：
```sql
create policy "自分のファイルのみ"
  on storage.objects for all
  using (auth.uid()::text = (storage.foldername(name))[1]);
```

## 注意事項
- 既存の `kak_*` テーブルには**絶対に触れない**
- `supabaseAdmin` はServer Actionのみで使用
- 日本語を含むINSERT文はSQL Editorで直接実行すること

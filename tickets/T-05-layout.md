# T-05 レイアウト（公開ヘッダー・認証後サイドバー）

## 担当エージェント
@ui-designer @frontend-developer

## 目的
公開ページ用と認証後ページ用の2種類のレイアウトを実装する。
企業向けSaaSらしいスタイリッシュなサイドバーレイアウトを実現する。

## 前提チケット
- T-01・T-02・T-04完了済みであること

## 完了条件
- [ ] 公開ページはヘッダーのみのシンプルなレイアウト
- [ ] 認証後はサイドバー（240px）＋コンテンツエリアのレイアウト
- [ ] サイドバーのアクティブリンクがティール色になる
- [ ] ログアウトが動作する

## ルートグループ構成
```
app/
  (public)/layout.tsx    # 公開ヘッダーのみ
  (auth)/layout.tsx      # 中央寄せ・ロゴのみ
  (app)/layout.tsx       # サイドバー＋コンテンツ
```

## サイドバー構成
```
[V] Vettly                    ← ロゴ（ティール）

メインメニュー
  ダッシュボード    /dashboard
  候補者管理        /candidates
  求人ポジション    /positions

────────────────
設定              /settings
ログアウト
```

### アクティブリンクのスタイル
- 非アクティブ: `text-[#6B7F7C] hover:text-[#1C2B35] hover:bg-[#F4F6F5]`
- アクティブ: `bg-[#E6F5F3] text-[#00A896] font-medium`

## アイコン（lucide-react）
```bash
npm install lucide-react
```

| ページ | アイコン |
|--------|---------|
| ダッシュボード | `LayoutDashboard` |
| 候補者管理 | `Users` |
| 求人ポジション | `Briefcase` |
| 設定 | `Settings` |
| ログアウト | `LogOut` |

## 注意事項
- サイドバーは `'use client'`（usePathnameでアクティブ判定）
- レイアウト本体はServer Componentのまま
- 全体背景: `bg-[#F9F8F6]`

---
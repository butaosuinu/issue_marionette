# issue_marionette 仕様書

## 1. 概要

### 1.1 プロダクト概要
issue_marionetteは、GitHub issueをタスクとして扱うCoding Agentオーケストレーターツールです。
Vibe KanbanやConductorに類似した機能を提供し、複数のClaude Codeエージェントを並列で管理できます。

### 1.2 主な機能
- GitHub issueをタスクの基本単位として扱う
- カンバン形式でissueを可視化
- issueをクリックするとgit worktreeを作成し、Claude Codeを起動
- 複数のworktree/エージェントを同時に管理
- 編集結果のレビューとPR作成
- 統合ターミナルとDiffビューアー

### 1.3 対象ユーザー
- ソフトウェア開発者
- AIコーディングアシスタントを活用したい開発チーム

---

## 2. 技術スタック

### 2.1 フロントエンド
| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フレームワーク | React | 19.x |
| 言語 | TypeScript | 5.x |
| ビルドツール | Vite | 7.x |
| UIフレームワーク | Tailwind CSS | 3.x |
| 状態管理 | Jotai | 2.x |
| ルーティング | TanStack Router | 1.x |
| ターミナル | @xterm/xterm | 5.x |
| エディタ | Monaco Editor | - |
| 国際化 | lingui | 5.x |

### 2.2 バックエンド
| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フレームワーク | Tauri | 2.x |
| 言語 | Rust | 2021 edition |
| HTTP | reqwest | 0.12.x |
| 非同期 | tokio | 1.x |
| PTY | portable-pty | 0.8.x |

### 2.3 外部サービス
- GitHub API（OAuth、Issues、Pull Requests）
- Claude CLI（ローカルインストール必須）

---

## 3. 機能仕様

### 3.1 認証機能

#### 3.1.1 GitHub OAuth認証
- **認証フロー**: OAuth 2.0 Authorization Code Flow
- **スコープ**: `repo`, `user`
- **カスタムURLスキーム**: `issue-marionette://oauth-callback`
- **トークン保存**: tauri-plugin-storeで暗号化保存

#### 3.1.2 認証状態
```typescript
type AuthState = {
  isAuthenticated: boolean
  accessToken: string | undefined
  user: GitHubUser | undefined
  expiresAt: string | undefined
}
```

### 3.2 リポジトリ管理

#### 3.2.1 リポジトリ登録
- ローカルパスを指定してリポジトリを登録
- GitHub APIからリポジトリ情報を取得
- 複数リポジトリの管理に対応

#### 3.2.2 データモデル
```typescript
type Repository = {
  id: string
  owner: string
  name: string
  fullName: string
  localPath: string
  defaultBranch: string
  isPrivate: boolean
  createdAt: string
  updatedAt: string
}
```

### 3.3 カンバンボード

#### 3.3.1 カラム構成
- ユーザーがカスタマイズ可能
- デフォルト: Backlog, In Progress, Review, Done
- issueのラベル/状態でフィルタリング

#### 3.3.2 Issueカード
```typescript
type Issue = {
  id: number
  number: number
  title: string
  body: string | undefined
  state: 'open' | 'closed'
  labels: ReadonlyArray<IssueLabel>
  milestone: IssueMilestone | undefined
  assignees: ReadonlyArray<IssueAssignee>
  repositoryId: string
  createdAt: string
  updatedAt: string
  closedAt: string | undefined
}
```

#### 3.3.3 操作
- ドラッグ&ドロップでカード移動
- カードクリックでworktree作成・エージェント起動
- カード詳細表示（Markdownレンダリング）

### 3.4 Worktree管理

#### 3.4.1 Worktree作成
- issueクリック時に自動作成
- ブランチ名: `issue-{number}-{slug}`
- 保存先: リポジトリ同階層の `repo-worktrees/`

#### 3.4.2 データモデル
```typescript
type WorktreeStatus = 'creating' | 'ready' | 'working' | 'reviewing' | 'merged'

type Worktree = {
  id: string
  repositoryId: string
  issueNumber: number
  branchName: string
  path: string
  status: WorktreeStatus
  createdAt: string
  updatedAt: string
}
```

### 3.5 Claude Code統合

#### 3.5.1 エージェント起動
- worktree内でclaude CLIを起動
- Plan modeでタスクを開始
- issue内容をコンテキストとして渡す

#### 3.5.2 セッション管理
```typescript
type AgentMode = 'plan' | 'act'
type AgentStatus = 'starting' | 'running' | 'waiting' | 'completed' | 'error'

type AgentSession = {
  id: string
  worktreeId: string
  mode: AgentMode
  status: AgentStatus
  startedAt: string
  completedAt: string | undefined
}
```

#### 3.5.3 出力表示
- リッチUI表示（Markdownレンダリング）
- シンタックスハイライト
- リアルタイムストリーミング

#### 3.5.4 タブ管理
- 1つのworktreeに対して複数のエージェントを起動可能
- タブで切り替え

### 3.6 ターミナル機能

#### 3.6.1 実装
- xterm.jsによるターミナルエミュレーション
- PTY（疑似端末）によるシェル操作
- リサイズ対応

#### 3.6.2 機能
- 各worktreeに対してシェル操作可能
- 複数ターミナルタブ対応

### 3.7 Diffビューアー

#### 3.7.1 実装
- Monaco Editorのdiff機能を使用
- VSCode風のUI

#### 3.7.2 機能
- サイドバイサイド表示
- インライン表示
- ファイルツリーによるファイル選択

### 3.8 PR作成機能

#### 3.8.1 フロー
1. 編集結果をレビュー
2. PR作成フォームで内容を入力
3. issueに紐づけ（`Closes #xxx`）
4. GitHub APIでPR作成
5. マージ後にissueを自動クローズ

### 3.9 設定機能

#### 3.9.1 一般設定
```typescript
type Settings = {
  theme: 'dark' | 'light' | 'system'
  locale: 'ja' | 'en'
  worktreeBasePath: string
  claudeCliPath: string
}
```

#### 3.9.2 カンバン設定
```typescript
type KanbanColumn = {
  id: string
  title: string
  filter: IssueFilter
  order: number
}

type KanbanConfig = {
  columns: ReadonlyArray<KanbanColumn>
}
```

---

## 4. UI/UX仕様

### 4.1 レイアウト構成

```
┌─────────────────────────────────────────────────────────┐
│ Header                                    [Theme] [User]│
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ Sidebar  │  Main Content                                │
│          │  (カンバン / ワークスペース / 設定)           │
│          │                                              │
│          │                                              │
│          │                                              │
│          │                                              │
│          ├──────────────────────────────────────────────┤
│          │  Terminal / Diff Viewer                      │
└──────────┴──────────────────────────────────────────────┘
```

### 4.2 テーマ
- ダークモード（デフォルト）
- ライトモード
- システム設定に追従

### 4.3 国際化
- 日本語（デフォルト）
- 英語

---

## 5. アーキテクチャ

### 5.1 ディレクトリ構造

#### フロントエンド (`src/`)
```
src/
├── main.tsx                    # エントリーポイント
├── index.css                   # Tailwind CSS
├── routeTree.gen.ts            # 自動生成ルート
├── routes/                     # TanStack Router
│   ├── __root.tsx
│   ├── index.tsx               # カンバンボード
│   ├── settings.tsx
│   └── workspace/
│       └── $worktreeId.tsx
├── components/
│   ├── layout/                 # Header, Sidebar, MainLayout
│   ├── auth/                   # LoginButton, UserMenu
│   ├── repository/             # RepositoryList, RepositoryForm
│   ├── kanban/                 # KanbanBoard, KanbanColumn, IssueCard
│   ├── workspace/              # WorkspacePanel, AgentTabBar, AgentOutput
│   ├── terminal/               # Terminal, TerminalTabs
│   └── editor/                 # DiffViewer, FileTree
├── stores/                     # Jotai atoms
│   ├── authAtoms.ts
│   ├── repositoryAtoms.ts
│   ├── issueAtoms.ts
│   ├── worktreeAtoms.ts
│   ├── agentAtoms.ts
│   ├── kanbanAtoms.ts
│   └── settingsAtoms.ts
├── hooks/                      # カスタムフック
├── services/                   # Tauri invoke ラッパー
├── types/                      # 型定義
├── i18n/                       # 国際化
│   ├── index.ts
│   └── locales/
│       ├── ja.ts
│       └── en.ts
└── utils/                      # ユーティリティ
```

#### バックエンド (`src-tauri/`)
```
src-tauri/
├── src/
│   ├── main.rs
│   ├── lib.rs                  # Tauriアプリ設定
│   ├── commands/               # Tauriコマンド
│   │   ├── mod.rs
│   │   ├── github.rs           # OAuth, GitHub API
│   │   ├── worktree.rs         # git worktree管理
│   │   ├── agent.rs            # Claude Code管理
│   │   ├── shell.rs            # PTY操作
│   │   └── storage.rs          # データ永続化
│   ├── services/               # ビジネスロジック
│   │   ├── mod.rs
│   │   ├── github_client.rs
│   │   ├── oauth.rs
│   │   ├── git.rs
│   │   └── process.rs
│   └── models/                 # データモデル
│       ├── mod.rs
│       ├── repository.rs
│       ├── issue.rs
│       ├── worktree.rs
│       └── agent.rs
├── Cargo.toml
├── tauri.conf.json
└── capabilities/
```

### 5.2 Tauriコマンド一覧

| コマンド | 説明 |
|----------|------|
| `start_oauth_flow` | OAuth認証開始 |
| `exchange_oauth_code` | アクセストークン取得 |
| `get_authenticated_user` | ユーザー情報取得 |
| `create_worktree` | worktree作成 |
| `list_worktrees` | worktree一覧取得 |
| `remove_worktree` | worktree削除 |
| `get_worktree_diff` | diff取得 |
| `start_agent` | Claude Code起動 |
| `stop_agent` | エージェント停止 |
| `send_agent_input` | エージェントに入力送信 |
| `get_agent_status` | エージェント状態取得 |
| `create_pty_session` | PTYセッション作成 |
| `write_pty` | PTY入力 |
| `resize_pty` | PTYリサイズ |
| `close_pty` | PTYセッション終了 |
| `save_repository` | リポジトリ保存 |
| `load_repositories` | リポジトリ読み込み |
| `delete_repository` | リポジトリ削除 |

### 5.3 イベント

| イベント | 説明 |
|----------|------|
| `agent-output` | エージェント出力 |
| `agent-status-changed` | エージェント状態変更 |
| `pty-output` | PTY出力 |

---

## 6. セキュリティ

### 6.1 認証情報の保護
- アクセストークンはtauri-plugin-storeで暗号化保存
- OAuth client_secretは環境変数で管理

### 6.2 コンテンツセキュリティポリシー
- 開発時: CSP無効
- 本番時: 適切なCSPを設定

---

## 7. 非機能要件

### 7.1 パフォーマンス
- Issue一覧のページネーション対応
- 大量出力時の仮想スクロール
- メモ化による再レンダリング最適化

### 7.2 エラーハンドリング
- ネットワークエラーのリトライ
- GitHub APIレート制限対応
- プロセス異常終了時の処理

### 7.3 アクセシビリティ
- キーボードナビゲーション
- スクリーンリーダー対応

---

## 8. 開発ガイドライン

### 8.1 コーディング規約
CLAUDE.mdに従う:
- `any`型禁止
- 型アサーション禁止
- `const`優先
- `null`は DOM関連以外で使用禁止
- RORO パターン採用

### 8.2 テスト戦略
Testing Trophyに従う:
- インテグレーションテスト最優先
- React Testing Library使用
- MSWでAPIモック

---

## 付録

### A. 環境変数
```
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```

### B. 参考リンク
- [Vibe Kanban](https://www.vibekanban.com/)
- [Conductor](https://www.conductor.build/)
- [Tauri Documentation](https://tauri.app/)
- [TanStack Router](https://tanstack.com/router)

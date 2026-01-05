# issue_marionette アーキテクチャ

## システム構成図

```
┌────────────────────────────────────────────────────────────────────┐
│                         issue_marionette                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Frontend (React + TypeScript)             │   │
│  │                                                              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │   │
│  │  │  Routes  │ │Components│ │  Stores  │ │  Hooks   │       │   │
│  │  │(TanStack)│ │(UI/Layout│ │ (Jotai)  │ │(Custom)  │       │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │   │
│  │       │            │            │            │              │   │
│  │       └────────────┴────────────┴────────────┘              │   │
│  │                           │                                  │   │
│  │                    ┌──────┴──────┐                          │   │
│  │                    │  Services   │                          │   │
│  │                    │(Tauri Invoke)                          │   │
│  │                    └──────┬──────┘                          │   │
│  └───────────────────────────┼──────────────────────────────────┘   │
│                              │                                      │
│                        Tauri IPC                                    │
│                              │                                      │
│  ┌───────────────────────────┼──────────────────────────────────┐   │
│  │                    Backend (Rust + Tauri)                     │   │
│  │                           │                                   │   │
│  │                    ┌──────┴──────┐                           │   │
│  │                    │  Commands   │                           │   │
│  │                    │ (Handlers)  │                           │   │
│  │                    └──────┬──────┘                           │   │
│  │       ┌───────────────────┼───────────────────┐              │   │
│  │       │                   │                   │              │   │
│  │  ┌────┴────┐        ┌────┴────┐        ┌────┴────┐         │   │
│  │  │Services │        │ Models  │        │  State  │         │   │
│  │  │(Logic)  │        │ (Data)  │        │(Runtime)│         │   │
│  │  └────┬────┘        └─────────┘        └─────────┘         │   │
│  │       │                                                      │   │
│  └───────┼──────────────────────────────────────────────────────┘   │
│          │                                                          │
└──────────┼──────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        External Systems                              │
│                                                                      │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐                │
│  │  GitHub    │    │   Git      │    │ Claude CLI │                │
│  │   API      │    │ (worktree) │    │  (PTY)     │                │
│  └────────────┘    └────────────┘    └────────────┘                │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## データフロー

### 1. GitHub認証フロー

```
User                Frontend              Backend               GitHub
 │                     │                     │                     │
 │  Click Login        │                     │                     │
 │────────────────────>│                     │                     │
 │                     │  start_oauth_flow   │                     │
 │                     │────────────────────>│                     │
 │                     │                     │  Open Auth URL      │
 │                     │                     │────────────────────>│
 │                     │                     │                     │
 │  Authorize          │                     │                     │
 │─────────────────────────────────────────────────────────────────>│
 │                     │                     │                     │
 │                     │                     │  Callback (code)    │
 │                     │                     │<────────────────────│
 │                     │                     │                     │
 │                     │                     │  Exchange Token     │
 │                     │                     │────────────────────>│
 │                     │                     │                     │
 │                     │                     │  Access Token       │
 │                     │                     │<────────────────────│
 │                     │                     │                     │
 │                     │  Auth Success       │                     │
 │                     │<────────────────────│                     │
 │  Show User Info     │                     │                     │
 │<────────────────────│                     │                     │
```

### 2. Worktree作成とエージェント起動フロー

```
User                Frontend              Backend                Git
 │                     │                     │                     │
 │  Click Issue Card   │                     │                     │
 │────────────────────>│                     │                     │
 │                     │  create_worktree    │                     │
 │                     │────────────────────>│                     │
 │                     │                     │  git worktree add   │
 │                     │                     │────────────────────>│
 │                     │                     │                     │
 │                     │                     │  Success            │
 │                     │                     │<────────────────────│
 │                     │                     │                     │
 │                     │  start_agent        │                     │
 │                     │────────────────────>│                     │
 │                     │                     │                     │
 │                     │                     │  Spawn PTY + claude │
 │                     │                     │────────────────────>│
 │                     │                     │                     │
 │                     │  agent-output event │                     │
 │                     │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─│                     │
 │  Show Output        │                     │                     │
 │<────────────────────│                     │                     │
```

## コンポーネント構成

### Frontend コンポーネント階層

```
App
├── I18nProvider (lingui)
└── RouterProvider (TanStack Router)
    └── MainLayout
        ├── Header
        │   ├── AppTitle
        │   ├── ThemeToggle
        │   └── UserMenu / LoginButton
        ├── Sidebar
        │   ├── RepositorySelector
        │   ├── Navigation
        │   └── WorktreeList
        └── Main Content
            ├── KanbanBoard (/)
            │   └── KanbanColumn[]
            │       └── IssueCard[]
            ├── WorkspacePage (/workspace/:id)
            │   ├── AgentTabBar
            │   ├── AgentOutput
            │   ├── Terminal
            │   └── DiffViewer
            └── SettingsPage (/settings)
```

### State管理 (Jotai Atoms)

```
stores/
├── authAtoms.ts
│   ├── authStateAtom          # 認証状態
│   └── isAuthenticatedAtom    # 派生atom
│
├── repositoryAtoms.ts
│   ├── repositoriesAtom       # リポジトリ一覧
│   ├── selectedRepositoryIdAtom
│   └── selectedRepositoryAtom # 派生atom
│
├── issueAtoms.ts
│   ├── issuesAtom             # Issue一覧
│   └── issuesByRepositoryAtom # 派生atom
│
├── worktreeAtoms.ts
│   ├── worktreesAtom          # Worktree一覧
│   ├── activeWorktreeIdAtom
│   └── activeWorktreeAtom     # 派生atom
│
├── agentAtoms.ts
│   ├── agentSessionsAtom      # セッション一覧
│   ├── agentOutputsAtom       # 出力データ
│   ├── activeAgentTabAtom
│   └── agentsByWorktreeAtom   # atomFamily
│
├── kanbanAtoms.ts
│   ├── kanbanConfigAtom       # カラム設定
│   └── kanbanColumnsAtom      # 派生atom
│
└── settingsAtoms.ts
    ├── settingsAtom           # 全設定
    ├── themeAtom              # read/write atom
    ├── localeAtom             # read/write atom
    └── resolvedThemeAtom      # 派生atom (system対応)
```

## Backend モジュール構成

### Commands (Tauriコマンドハンドラ)

```rust
commands/
├── github.rs
│   ├── start_oauth_flow()
│   ├── exchange_oauth_code()
│   ├── get_authenticated_user()
│   ├── get_repository_issues()
│   └── create_pull_request()
│
├── worktree.rs
│   ├── create_worktree()
│   ├── list_worktrees()
│   ├── remove_worktree()
│   └── get_worktree_diff()
│
├── agent.rs
│   ├── start_agent()
│   ├── stop_agent()
│   ├── send_agent_input()
│   └── get_agent_status()
│
├── shell.rs
│   ├── create_pty_session()
│   ├── write_pty()
│   ├── resize_pty()
│   └── close_pty()
│
└── storage.rs
    ├── save_repository()
    ├── load_repositories()
    └── delete_repository()
```

### Services (ビジネスロジック)

```rust
services/
├── github_client.rs   # GitHub API クライアント
├── oauth.rs           # OAuth フロー
├── git.rs             # Git コマンドラッパー
└── process.rs         # プロセス管理
```

## ファイル保存場所

```
~/.issue_marionette/           # アプリデータ
├── config.json                # 設定ファイル
├── repositories.json          # 登録リポジトリ
└── auth/
    └── token.json             # 暗号化トークン

{repo-parent}/
├── {repo-name}/               # メインリポジトリ
└── {repo-name}-worktrees/     # Worktree保存先
    ├── issue-1-feature/
    ├── issue-2-bugfix/
    └── ...
```

## 技術選定理由

| 技術 | 選定理由 |
|------|----------|
| Tauri | 軽量なデスクトップアプリ、Rust統合 |
| React 19 | 最新の機能、豊富なエコシステム |
| TanStack Router | 型安全、ファイルベースルーティング |
| Jotai | シンプルな状態管理、atom構成 |
| Tailwind CSS | 高速なUI開発、一貫したデザイン |
| Monaco Editor | VSCode同等の編集・diff機能 |
| xterm.js | 高機能ターミナルエミュレーション |
| lingui | 軽量なi18n、TypeScript対応 |
| portable-pty | クロスプラットフォームPTY |

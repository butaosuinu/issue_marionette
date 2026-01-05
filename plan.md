# issue_marionette 開発計画

## 概要
GitHub issueをタスクとして扱うCoding Agentオーケストレーターツール

## 並列作業可能なタスク一覧

### 独立タスク（並列実行可能）

| タスクID | Issue | タスク名 | 担当領域 | 依存関係 |
|----------|-------|----------|----------|----------|
| TASK-01 | [#5](https://github.com/butaosuinu/issue_marionette/issues/5) | GitHub OAuth認証（Rust） | Backend | なし |
| TASK-02 | [#6](https://github.com/butaosuinu/issue_marionette/issues/6) | GitHub OAuth認証（React） | Frontend | なし |
| TASK-03 | [#7](https://github.com/butaosuinu/issue_marionette/issues/7) | リポジトリ管理UI | Frontend | なし |
| TASK-04 | [#8](https://github.com/butaosuinu/issue_marionette/issues/8) | カンバンボードUI | Frontend | なし |
| TASK-05 | [#9](https://github.com/butaosuinu/issue_marionette/issues/9) | ターミナルコンポーネント | Frontend | TASK-10 |
| TASK-06 | [#10](https://github.com/butaosuinu/issue_marionette/issues/10) | DiffビューアーUI | Frontend | なし |
| TASK-07 | [#11](https://github.com/butaosuinu/issue_marionette/issues/11) | GitHub Issues API連携（Rust） | Backend | TASK-01 |
| TASK-08 | [#12](https://github.com/butaosuinu/issue_marionette/issues/12) | Worktree管理機能（Rust） | Backend | なし |
| TASK-09 | [#13](https://github.com/butaosuinu/issue_marionette/issues/13) | Claude Code起動機能（Rust） | Backend | TASK-08 |
| TASK-10 | [#14](https://github.com/butaosuinu/issue_marionette/issues/14) | PTYシェル機能（Rust） | Backend | なし |

---

## TASK-01: GitHub OAuth認証（Rust）

### 概要
Rust側でGitHub OAuth認証フローを実装

### ファイル
- `src-tauri/src/commands/github.rs`
- `src-tauri/src/services/oauth.rs`
- `src-tauri/tauri.conf.json`（カスタムURLスキーム設定）

### 実装内容
1. OAuth認証URL生成
2. カスタムURLスキーム（`issue-marionette://`）の設定
3. コールバック受信とトークン取得
4. トークンの安全な保存（tauri-plugin-store）

### 受け入れ条件
- [ ] ブラウザでGitHub認証ページが開く
- [ ] 認証後、アプリにリダイレクトされる
- [ ] アクセストークンが安全に保存される

---

## TASK-02: GitHub OAuth認証（React）

### 概要
React側でGitHub OAuth認証UIを実装

### ファイル
- `src/components/auth/LoginButton.tsx`
- `src/components/auth/UserMenu.tsx`
- `src/stores/authAtoms.ts`
- `src/hooks/useGitHubAuth.ts`

### 実装内容
1. ログインボタンコンポーネント
2. ユーザーメニュー（アバター、ログアウト）
3. 認証状態管理（Jotai）
4. 認証フックの実装

### 受け入れ条件
- [ ] ログインボタンをクリックで認証開始
- [ ] 認証済みの場合ユーザー情報を表示
- [ ] ログアウト機能が動作する

---

## TASK-03: リポジトリ管理UI

### 概要
リポジトリの登録・一覧・選択UI

### ファイル
- `src/components/repository/RepositoryList.tsx`
- `src/components/repository/RepositoryForm.tsx`
- `src/components/repository/RepositorySelector.tsx`
- `src/stores/repositoryAtoms.ts`
- `src/types/repository.ts`

### 実装内容
1. リポジトリ一覧表示
2. リポジトリ追加フォーム（ローカルパス選択）
3. リポジトリ選択ドロップダウン
4. Jotai atomsの実装

### 受け入れ条件
- [ ] リポジトリを追加できる
- [ ] リポジトリ一覧が表示される
- [ ] リポジトリを切り替えられる

---

## TASK-04: カンバンボードUI

### 概要
カンバンボードのUI実装（ドラッグ&ドロップ含む）

### ファイル
- `src/components/kanban/KanbanBoard.tsx`
- `src/components/kanban/KanbanColumn.tsx`
- `src/components/kanban/IssueCard.tsx`
- `src/components/kanban/ColumnSettings.tsx`
- `src/stores/kanbanAtoms.ts`
- `src/stores/issueAtoms.ts`

### 実装内容
1. カンバンボードレイアウト
2. カラムコンポーネント（カスタマイズ可能）
3. Issueカードコンポーネント
4. ドラッグ&ドロップ（@dnd-kit/core使用）
5. カラム設定UI

### 受け入れ条件
- [ ] カラムが表示される
- [ ] Issueカードが表示される
- [ ] ドラッグ&ドロップでカード移動可能
- [ ] カラムをカスタマイズできる

---

## TASK-05: ターミナルコンポーネント

### 概要
xterm.jsを使用したターミナルコンポーネント

### ファイル
- `src/components/terminal/Terminal.tsx`
- `src/components/terminal/TerminalTabs.tsx`
- `src/hooks/useTerminal.ts`

### 実装内容
1. xterm.js初期化
2. フィットアドオン（リサイズ対応）
3. Tauri PTYとの接続
4. 複数ターミナルタブ対応

### 受け入れ条件
- [ ] ターミナルが表示される
- [ ] 入力が反映される
- [ ] リサイズに対応する
- [ ] 複数タブをサポート

---

## TASK-06: DiffビューアーUI

### 概要
Monaco Editorを使用したDiffビューアー

### ファイル
- `src/components/editor/DiffViewer.tsx`
- `src/components/editor/FileTree.tsx`
- `src/hooks/useDiff.ts`

### 実装内容
1. Monaco Editor Diff初期化
2. サイドバイサイド/インライン切替
3. ファイルツリー表示
4. 変更ファイル一覧

### 受け入れ条件
- [ ] Diff表示される
- [ ] ファイルを選択できる
- [ ] 表示モード切替可能

---

## TASK-07: GitHub Issues API連携（Rust）

### 概要
GitHub Issues APIの呼び出し実装

### ファイル
- `src-tauri/src/commands/github.rs`
- `src-tauri/src/services/github_client.rs`

### 実装内容
1. Issue一覧取得
2. Issue詳細取得
3. ラベル・マイルストーン取得
4. PR作成API

### 受け入れ条件
- [ ] Issue一覧が取得できる
- [ ] Issue詳細が取得できる
- [ ] PRを作成できる

---

## TASK-08: Worktree管理機能（Rust）

### 概要
Git worktreeの作成・管理機能

### ファイル
- `src-tauri/src/commands/worktree.rs`
- `src-tauri/src/services/git.rs`

### 実装内容
1. worktree作成（ブランチ自動生成）
2. worktree一覧取得
3. worktree削除
4. diff取得

### 受け入れ条件
- [ ] worktreeを作成できる
- [ ] worktree一覧を取得できる
- [ ] worktreeを削除できる
- [ ] diffを取得できる

---

## TASK-09: Claude Code起動機能（Rust）

### 概要
Claude CLIの起動とプロセス管理

### ファイル
- `src-tauri/src/commands/agent.rs`
- `src-tauri/src/services/process.rs`

### 実装内容
1. PTYでclaude CLI起動
2. Plan modeでの起動オプション
3. 出力のストリーミング
4. プロセス管理（停止、状態取得）

### 受け入れ条件
- [ ] claude CLIを起動できる
- [ ] 出力をリアルタイムで取得できる
- [ ] プロセスを停止できる

---

## TASK-10: PTYシェル機能（Rust）

### 概要
汎用PTYシェル機能の実装

### ファイル
- `src-tauri/src/commands/shell.rs`
- `src-tauri/src/services/process.rs`

### 実装内容
1. PTYセッション作成
2. 入力送信
3. 出力受信（イベント）
4. リサイズ対応

### 受け入れ条件
- [ ] PTYセッションを作成できる
- [ ] 入力を送信できる
- [ ] 出力を受信できる
- [ ] リサイズできる

---

## 依存関係グラフ

```
TASK-01 (OAuth Rust) ──┐
                       ├──> TASK-07 (Issues API)
TASK-02 (OAuth React) ─┘

TASK-03 (Repo UI) ────────> 独立

TASK-04 (Kanban UI) ──────> 独立

TASK-05 (Terminal) ───────> TASK-10 (PTY Shell)

TASK-06 (Diff Viewer) ────> 独立

TASK-08 (Worktree) ───────> TASK-09 (Claude Code)

TASK-10 (PTY Shell) ──────> 独立
```

## 推奨並列グループ

### グループA（認証関連）
- TASK-01: GitHub OAuth認証（Rust）
- TASK-02: GitHub OAuth認証（React）

### グループB（UI関連）
- TASK-03: リポジトリ管理UI
- TASK-04: カンバンボードUI
- TASK-05: ターミナルコンポーネント
- TASK-06: DiffビューアーUI

### グループC（バックエンド関連）
- TASK-08: Worktree管理機能（Rust）
- TASK-10: PTYシェル機能（Rust）

### グループD（統合関連）- グループA,B,C完了後
- TASK-07: GitHub Issues API連携（Rust）
- TASK-09: Claude Code起動機能（Rust）

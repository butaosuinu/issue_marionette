# Issue Marionette

[English](README.md)

GitHub Issuesの管理と開発ワークフローの自動化を支援するTauriデスクトップアプリケーション。

## 機能

- **GitHub OAuth認証** - GitHub OAuth 2.0による安全なログイン
- **Issue管理** - カンバンボードでGitHub Issuesを表示・管理
- **Git Worktree管理** - Issue単位でGit Worktreeを作成・管理
- **統合ターミナル** - PTY対応の内蔵ターミナル
- **Claude Code連携** - AI支援による開発サポート
- **Diff Viewer** - Monaco Editorによるコード差分表示

## 技術スタック

### フロントエンド
- React 19 + TypeScript
- Vite 7
- Jotai（状態管理）
- TanStack Router（ルーティング）
- Tailwind CSS（スタイリング）
- Monaco Editor（差分表示）
- xterm.js（ターミナル）
- Lingui（i18n: 日本語/英語）

### バックエンド
- Rust + Tauri 2
- reqwest（HTTPクライアント）
- portable-pty（疑似ターミナル）

## 必要要件

- [Node.js](https://nodejs.org/) (v18以降)
- [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install)

## インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd geneva

# 依存関係をインストール
pnpm install
```

## 開発

```bash
# フロントエンド開発サーバー起動 (http://localhost:1420)
pnpm dev

# Tauri開発モード起動（ホットリロード対応）
pnpm tauri dev

# 本番用ビルド
pnpm build

# ネイティブアプリケーションビルド
pnpm tauri build
```

## テスト・品質管理

```bash
# テスト実行（ウォッチモード）
pnpm test

# テスト実行（一度きり）
pnpm test:run

# テストカバレッジ取得
pnpm test:coverage

# Lintチェック
pnpm lint

# Lint自動修正
pnpm lint:fix

# コードフォーマット
pnpm format

# 全チェック実行
pnpm check
```

## プロジェクト構造

```
.
├── src/                    # フロントエンド (React + TypeScript)
│   ├── components/         # Reactコンポーネント
│   │   ├── auth/           # 認証
│   │   ├── editor/         # エディタ (DiffViewer, FileTree)
│   │   ├── kanban/         # カンバンボード
│   │   ├── layout/         # レイアウト
│   │   ├── repository/     # リポジトリ管理
│   │   └── terminal/       # ターミナル
│   ├── hooks/              # カスタムフック
│   ├── stores/             # 状態管理 (Jotai Atoms)
│   ├── routes/             # ルーティング (TanStack Router)
│   ├── types/              # TypeScript型定義
│   └── i18n/               # 国際化
│
├── src-tauri/              # バックエンド (Rust + Tauri)
│   ├── src/
│   │   ├── commands/       # Tauriコマンド
│   │   ├── services/       # ビジネスロジック
│   │   └── models/         # データモデル
│   └── Cargo.toml          # Rust依存関係
│
└── package.json            # Node.js依存関係
```

## 推奨IDE設定

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## ライセンス

MIT

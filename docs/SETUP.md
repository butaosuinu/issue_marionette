# issue_marionette セットアップガイド

## 前提条件

### 必須ソフトウェア

| ソフトウェア | バージョン | 用途 |
|-------------|-----------|------|
| Node.js | 18.x 以上 | フロントエンド開発 |
| pnpm | 8.x 以上 | パッケージ管理 |
| Rust | 1.70 以上 | バックエンド開発 |
| Git | 2.x 以上 | バージョン管理 |
| Claude CLI | 最新 | AI エージェント |

### 推奨ソフトウェア

| ソフトウェア | 用途 |
|-------------|------|
| VS Code | IDE |
| GitHub CLI (gh) | GitHub操作 |

## インストール

### 1. リポジトリのクローン

```bash
git clone https://github.com/butaosuinu/issue_marionette.git
cd issue_marionette
```

### 2. 依存関係のインストール

```bash
# フロントエンド
pnpm install

# バックエンド（自動でダウンロードされる）
cd src-tauri
cargo build
cd ..
```

### 3. 環境変数の設定

`.env`ファイルを作成（開発時）:

```bash
# GitHub OAuth App の認証情報
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

### 4. GitHub OAuth App の作成

1. GitHub Settings > Developer settings > OAuth Apps
2. "New OAuth App" をクリック
3. 以下を設定:
   - Application name: `issue_marionette`
   - Homepage URL: `http://localhost:1420`
   - Authorization callback URL: `issue-marionette://oauth-callback`
4. Client ID と Client Secret をコピー

## 開発

### 開発サーバーの起動

```bash
# フロントエンドのみ（ブラウザ）
pnpm dev

# Tauriアプリとして起動（推奨）
pnpm tauri dev
```

### ビルド

```bash
# フロントエンドのビルド
pnpm build

# Tauriアプリのビルド
pnpm tauri build
```

### テスト

```bash
# フロントエンドテスト
pnpm test

# バックエンドテスト
cd src-tauri
cargo test
```

### リント・フォーマット

```bash
# フロントエンド
pnpm lint
pnpm format

# バックエンド
cd src-tauri
cargo fmt
cargo clippy
```

## ディレクトリ構造

```
issue_marionette/
├── src/                    # フロントエンド (React)
│   ├── components/         # UIコンポーネント
│   ├── routes/             # ページルート
│   ├── stores/             # Jotai atoms
│   ├── hooks/              # カスタムフック
│   ├── services/           # Tauri invoke
│   ├── types/              # 型定義
│   └── i18n/               # 国際化
├── src-tauri/              # バックエンド (Rust)
│   ├── src/
│   │   ├── commands/       # Tauriコマンド
│   │   ├── services/       # ビジネスロジック
│   │   └── models/         # データモデル
│   ├── Cargo.toml
│   └── tauri.conf.json
├── docs/                   # ドキュメント
├── public/                 # 静的ファイル
├── plan.md                 # 開発計画
├── package.json
└── README.md
```

## 開発フロー

### 1. Issue の確認

```bash
gh issue list
```

### 2. ブランチの作成

```bash
git checkout -b feature/issue-{number}-description
```

### 3. 開発

```bash
pnpm tauri dev
```

### 4. テスト

```bash
pnpm check
```

### 5. コミット

```bash
git add .
git commit -m "feat: description"
```

### 6. PR 作成

```bash
gh pr create --title "Title" --body "Closes #{number}"
```

## トラブルシューティング

### Tauri ビルドエラー

macOS の場合:
```bash
xcode-select --install
```

Linux の場合:
```bash
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev
```

### pnpm インストールエラー

```bash
pnpm approve-builds
```

### Rust コンパイルエラー

```bash
rustup update
cargo clean
cargo build
```

## 参考リンク

- [Tauri Documentation](https://tauri.app/v2/guide/)
- [React Documentation](https://react.dev/)
- [TanStack Router](https://tanstack.com/router/latest)
- [Jotai Documentation](https://jotai.org/)
- [Tailwind CSS](https://tailwindcss.com/)

# Issue Marionette

[日本語版はこちら](README.ja.md)

A Tauri desktop application for managing GitHub Issues and automating development workflows.

## Features

- **GitHub OAuth Authentication** - Secure login with GitHub OAuth 2.0
- **Issue Management** - View and manage GitHub Issues with a Kanban board interface
- **Git Worktree Management** - Create and manage Git worktrees per issue
- **Integrated Terminal** - Built-in terminal with PTY support
- **Claude Code Integration** - AI-powered development assistance
- **Diff Viewer** - View code changes with Monaco Editor

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite 7
- Jotai (State Management)
- TanStack Router (Routing)
- Tailwind CSS (Styling)
- Monaco Editor (Diff Viewer)
- xterm.js (Terminal)
- Lingui (i18n: Japanese/English)

### Backend
- Rust + Tauri 2
- reqwest (HTTP Client)
- portable-pty (Pseudo Terminal)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd geneva

# Install dependencies
pnpm install
```

## Development

```bash
# Start frontend development server (http://localhost:1420)
pnpm dev

# Start Tauri development mode (with hot reload)
pnpm tauri dev

# Build for production
pnpm build

# Build native application
pnpm tauri build
```

## Testing & Quality

```bash
# Run tests (watch mode)
pnpm test

# Run tests once
pnpm test:run

# Run tests with coverage
pnpm test:coverage

# Lint check
pnpm lint

# Fix lint issues
pnpm lint:fix

# Format code
pnpm format

# Run all checks
pnpm check
```

## Project Structure

```
.
├── src/                    # Frontend (React + TypeScript)
│   ├── components/         # React components
│   │   ├── auth/           # Authentication
│   │   ├── editor/         # Editor (DiffViewer, FileTree)
│   │   ├── kanban/         # Kanban board
│   │   ├── layout/         # Layout components
│   │   ├── repository/     # Repository management
│   │   └── terminal/       # Terminal
│   ├── hooks/              # Custom hooks
│   ├── stores/             # State management (Jotai Atoms)
│   ├── routes/             # Routing (TanStack Router)
│   ├── types/              # TypeScript type definitions
│   └── i18n/               # Internationalization
│
├── src-tauri/              # Backend (Rust + Tauri)
│   ├── src/
│   │   ├── commands/       # Tauri commands
│   │   ├── services/       # Business logic
│   │   └── models/         # Data models
│   └── Cargo.toml          # Rust dependencies
│
└── package.json            # Node.js dependencies
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## License

MIT

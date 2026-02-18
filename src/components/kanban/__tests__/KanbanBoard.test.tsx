import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider, atom } from "jotai";
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Issue } from "../../../types/kanban";

const mockGithubIssues = vi.hoisted(() => ({
  value: [] as Issue[],
}));

vi.mock("../../../stores/issueAtoms", async () => {
  const original = await vi.importActual("../../../stores/issueAtoms");
  return {
    ...original,
    githubIssuesSuspenseAtom: atom(() => mockGithubIssues.value),
  };
});

// eslint-disable-next-line import/first -- vi.mock must be called before importing mocked modules
import { KanbanBoard } from "../KanbanBoard";

const MOCK_ISSUES: readonly Issue[] = [
  {
    id: "1001",
    number: 1,
    title: "プロジェクト構造のセットアップ",
    body: "Tauri、React、TypeScriptでプロジェクトを初期化",
    state: "open",
    priority: "medium",
    labels: [{ id: "101", name: "setup", color: "#0366d6" }],
    assignee: "developer1",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    columnId: "backlog",
  },
  {
    id: "1002",
    number: 2,
    title: "カンバンボードUIの実装",
    body: "ドラッグ&ドロップ対応のカンバンボードを作成",
    state: "open",
    priority: "medium",
    labels: [{ id: "102", name: "feature", color: "#28a745" }],
    assignee: "developer2",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    columnId: "backlog",
  },
  {
    id: "1003",
    number: 3,
    title: "GitHub API連携",
    body: "GitHub APIを使用してissueを取得・更新する機能",
    state: "open",
    priority: "medium",
    labels: [
      { id: "102", name: "feature", color: "#28a745" },
      { id: "103", name: "api", color: "#5319e7" },
    ],
    assignee: undefined,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
    columnId: "backlog",
  },
];

const renderWithProvider = (ui: React.ReactElement) => render(<Provider>{ui}</Provider>);

describe("KanbanBoard", () => {
  beforeEach(() => {
    mockGithubIssues.value = [...MOCK_ISSUES];
  });

  it("デフォルトカラムが表示される", () => {
    renderWithProvider(<KanbanBoard />);

    expect(screen.getByText("Backlog")).toBeInTheDocument();
    expect(screen.getByText("Todo")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("Kanban Boardタイトルが表示される", () => {
    renderWithProvider(<KanbanBoard />);

    expect(screen.getByText("Kanban Board")).toBeInTheDocument();
  });

  it("Settingsボタンが表示される", () => {
    renderWithProvider(<KanbanBoard />);

    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("Issueカードが表示される", () => {
    renderWithProvider(<KanbanBoard />);

    expect(
      screen.getByText("プロジェクト構造のセットアップ")
    ).toBeInTheDocument();
    expect(screen.getByText("カンバンボードUIの実装")).toBeInTheDocument();
    expect(screen.getByText("GitHub API連携")).toBeInTheDocument();
  });

  it("Settingsボタンをクリックするとカラム設定モーダルが表示される", async () => {
    const user = userEvent.setup();
    renderWithProvider(<KanbanBoard />);

    const settingsButton = screen.getByText("Settings");
    await user.click(settingsButton);

    expect(screen.getByText("カラム設定")).toBeInTheDocument();
    expect(screen.getByText("新しいカラムを追加")).toBeInTheDocument();
  });

  it("カラム設定モーダルを閉じることができる", async () => {
    const user = userEvent.setup();
    renderWithProvider(<KanbanBoard />);

    const settingsButton = screen.getByText("Settings");
    await user.click(settingsButton);

    expect(screen.getByText("カラム設定")).toBeInTheDocument();

    const closeButton = screen.getByText("✕");
    await user.click(closeButton);

    expect(screen.queryByText("カラム設定")).not.toBeInTheDocument();
  });

  it("各カラムにカード数が表示される", () => {
    renderWithProvider(<KanbanBoard />);

    const countBadges = screen.getAllByText(/^\d+$/);
    expect(countBadges.length).toBeGreaterThan(0);
  });

  it("Issueカードにラベルが表示される", () => {
    renderWithProvider(<KanbanBoard />);

    expect(screen.getByText("setup")).toBeInTheDocument();
    expect(screen.getAllByText("feature").length).toBeGreaterThan(0);
  });

  it("Issueカードにアサインユーザーが表示される", () => {
    renderWithProvider(<KanbanBoard />);

    expect(screen.getAllByText("developer1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("developer2").length).toBeGreaterThan(0);
  });
});

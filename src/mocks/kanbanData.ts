import type { Issue } from "../types";

export const MOCK_ISSUES: readonly Issue[] = Object.freeze([
  {
    id: "issue-1",
    number: 1,
    title: "プロジェクト構造のセットアップ",
    body: "Tauri、React、TypeScriptでプロジェクトを初期化",
    state: "open",
    priority: "high",
    labels: [{ id: "label-1", name: "setup", color: "#0366d6" }],
    assignee: "developer1",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    columnId: "done",
  },
  {
    id: "issue-2",
    number: 2,
    title: "カンバンボードUIの実装",
    body: "ドラッグ&ドロップ対応のカンバンボードを作成",
    state: "open",
    priority: "high",
    labels: [{ id: "label-2", name: "feature", color: "#28a745" }],
    assignee: "developer2",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    columnId: "in-progress",
  },
  {
    id: "issue-3",
    number: 3,
    title: "GitHub API連携",
    body: "GitHub APIを使用してissueを取得・更新する機能",
    state: "open",
    priority: "medium",
    labels: [
      { id: "label-2", name: "feature", color: "#28a745" },
      { id: "label-3", name: "api", color: "#5319e7" },
    ],
    assignee: undefined,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
    columnId: "backlog",
  },
  {
    id: "issue-4",
    number: 4,
    title: "ユーザー認証機能",
    body: "GitHubのOAuth認証を実装",
    state: "open",
    priority: "high",
    labels: [{ id: "label-4", name: "security", color: "#d73a4a" }],
    assignee: "developer1",
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-04T00:00:00Z",
    columnId: "todo",
  },
  {
    id: "issue-5",
    number: 5,
    title: "UIデザインの改善",
    body: "ダークモード対応とアクセシビリティの向上",
    state: "open",
    priority: "low",
    labels: [{ id: "label-5", name: "design", color: "#fbca04" }],
    assignee: undefined,
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z",
    columnId: "backlog",
  },
  {
    id: "issue-6",
    number: 6,
    title: "テストカバレッジの向上",
    body: "ユニットテストとインテグレーションテストを追加",
    state: "open",
    priority: "medium",
    labels: [{ id: "label-6", name: "testing", color: "#0e8a16" }],
    assignee: "developer2",
    createdAt: "2024-01-06T00:00:00Z",
    updatedAt: "2024-01-06T00:00:00Z",
    columnId: "review",
  },
]);

export const createMockIssuesMap = (
  issues: readonly Issue[]
): Record<string, Issue> => {
  return issues.reduce<Record<string, Issue>>(
    (acc, issue) => ({ ...acc, [issue.id]: issue }),
    {}
  );
};

export const createMockIssuesByColumn = (
  issues: readonly Issue[]
): Record<string, string[]> => {
  return issues.reduce<Record<string, string[]>>(
    (acc, issue) => ({
      ...acc,
      [issue.columnId]: [...(acc[issue.columnId] ?? []), issue.id],
    }),
    {}
  );
};

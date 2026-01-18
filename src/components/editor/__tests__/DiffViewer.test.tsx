import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider, createStore } from "jotai";
import { I18nProvider } from "@lingui/react";
import { i18n } from "../../../i18n/config";
import type { FileDiff, DiffResponse } from "../../../types/diff";

const { mockInvoke } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: mockInvoke,
}));

vi.mock("@monaco-editor/react", () => ({
  DiffEditor: ({
    original,
    modified,
    language,
  }: {
    original: string;
    modified: string;
    language: string;
  }) => (
    <div data-testid="diff-editor">
      <div data-testid="original-content">{original}</div>
      <div data-testid="modified-content">{modified}</div>
      <div data-testid="language">{language}</div>
    </div>
  ),
}));

// eslint-disable-next-line import/first -- vi.mock must be called before importing mocked modules
import { DiffViewer } from "../DiffViewer";
// eslint-disable-next-line import/first -- vi.mock must be called before importing mocked modules
import { diffStateAtom } from "../../../stores/diffAtoms";
// eslint-disable-next-line import/first -- vi.mock must be called before importing mocked modules
import { DEFAULT_DIFF_STATE } from "../../../constants/diff";

const createMockFileDiff = (overrides: Partial<FileDiff> = {}): FileDiff => ({
  path: "src/App.tsx",
  oldPath: undefined,
  status: "modified",
  additions: 5,
  deletions: 2,
  oldContent: "old content",
  newContent: "new content",
  ...overrides,
});

const createMockDiffResponse = (files: FileDiff[] = []): DiffResponse => ({
  files,
});

const renderWithProviders = (
  ui: React.ReactElement,
  store = createStore()
) =>
  render(
    <Provider store={store}>
      <I18nProvider i18n={i18n}>{ui}</I18nProvider>
    </Provider>
  );

describe("DiffViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("worktreePath が undefined の場合、変更なし状態を表示する", () => {
    const store = createStore();
    store.set(diffStateAtom, DEFAULT_DIFF_STATE);

    renderWithProviders(<DiffViewer />, store);

    expect(screen.getByText("変更はありません")).toBeInTheDocument();
  });

  it("ローディング状態を表示する", () => {
    const store = createStore();
    store.set(diffStateAtom, { ...DEFAULT_DIFF_STATE, isLoading: true });

    renderWithProviders(<DiffViewer />, store);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("エラー状態を表示する", async () => {
    mockInvoke.mockRejectedValue(new Error("Failed to get diff"));

    renderWithProviders(<DiffViewer worktreePath="/path/to/worktree" />);

    await waitFor(() => {
      expect(screen.getByText("差分の取得に失敗しました")).toBeInTheDocument();
    });
  });

  it("変更ファイルがない場合、変更なし状態を表示する", async () => {
    mockInvoke.mockResolvedValue(createMockDiffResponse([]));

    renderWithProviders(<DiffViewer worktreePath="/path/to/worktree" />);

    await waitFor(() => {
      expect(screen.getByText("変更はありません")).toBeInTheDocument();
    });
  });

  it("ファイルツリーを表示する", async () => {
    const mockFiles = [createMockFileDiff({ path: "src/App.tsx" })];
    mockInvoke.mockResolvedValue(createMockDiffResponse(mockFiles));

    renderWithProviders(<DiffViewer worktreePath="/path/to/worktree" />);

    await waitFor(() => {
      expect(screen.getByText("App.tsx")).toBeInTheDocument();
    });
  });

  it("最初のファイルが自動選択される", async () => {
    const mockFiles = [
      createMockFileDiff({
        path: "src/App.tsx",
        oldContent: "old app",
        newContent: "new app",
      }),
    ];
    mockInvoke.mockResolvedValue(createMockDiffResponse(mockFiles));

    renderWithProviders(<DiffViewer worktreePath="/path/to/worktree" />);

    await waitFor(() => {
      expect(screen.getByTestId("diff-editor")).toBeInTheDocument();
    });

    expect(screen.getByTestId("original-content")).toHaveTextContent("old app");
    expect(screen.getByTestId("modified-content")).toHaveTextContent("new app");
  });

  it("ファイルをクリックするとそのファイルの diff を表示する", async () => {
    const user = userEvent.setup();
    const mockFiles = [
      createMockFileDiff({
        path: "src/App.tsx",
        oldContent: "old app",
        newContent: "new app",
      }),
      createMockFileDiff({
        path: "src/utils/helper.ts",
        oldContent: "old helper",
        newContent: "new helper",
      }),
    ];
    mockInvoke.mockResolvedValue(createMockDiffResponse(mockFiles));

    renderWithProviders(<DiffViewer worktreePath="/path/to/worktree" />);

    await waitFor(() => {
      expect(screen.getByText("helper.ts")).toBeInTheDocument();
    });

    await user.click(screen.getByText("helper.ts"));

    await waitFor(() => {
      expect(screen.getByTestId("original-content")).toHaveTextContent(
        "old helper"
      );
      expect(screen.getByTestId("modified-content")).toHaveTextContent(
        "new helper"
      );
    });
  });

  it("追加/削除の統計を表示する", async () => {
    const mockFiles = [
      createMockFileDiff({
        path: "src/App.tsx",
        additions: 10,
        deletions: 3,
      }),
    ];
    mockInvoke.mockResolvedValue(createMockDiffResponse(mockFiles));

    renderWithProviders(<DiffViewer worktreePath="/path/to/worktree" />);

    await waitFor(() => {
      expect(screen.getByText("+10")).toBeInTheDocument();
      expect(screen.getByText("-3")).toBeInTheDocument();
    });
  });

  it("ビューモード切替ボタンが表示される", async () => {
    const mockFiles = [createMockFileDiff()];
    mockInvoke.mockResolvedValue(createMockDiffResponse(mockFiles));

    renderWithProviders(<DiffViewer worktreePath="/path/to/worktree" />);

    await waitFor(() => {
      expect(screen.getByTitle("並列表示")).toBeInTheDocument();
      expect(screen.getByTitle("インライン表示")).toBeInTheDocument();
    });
  });

  it("ファイルの言語が正しく設定される", async () => {
    const mockFiles = [
      createMockFileDiff({
        path: "src/App.tsx",
      }),
    ];
    mockInvoke.mockResolvedValue(createMockDiffResponse(mockFiles));

    renderWithProviders(<DiffViewer worktreePath="/path/to/worktree" />);

    await waitFor(() => {
      expect(screen.getByTestId("language")).toHaveTextContent("typescript");
    });
  });
});

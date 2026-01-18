import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider, createStore } from "jotai";
import { I18nProvider } from "@lingui/react";
import { i18n } from "../../../i18n/config";
import type { FileDiff, FileTreeNode, DiffViewMode } from "../../../types/diff";

const mockUseDiff = vi.fn();

vi.mock("../../../hooks/useDiff", () => ({
  useDiff: (): ReturnType<typeof mockUseDiff> => mockUseDiff(),
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

type UseDiffReturn = {
  files: FileDiff[];
  selectedFilePath: string | undefined;
  selectedFileDiff: FileDiff | undefined;
  viewMode: DiffViewMode;
  fileTree: FileTreeNode[];
  stats: { additions: number; deletions: number };
  selectFile: (params: { filePath: string | undefined }) => void;
  setViewMode: (params: { mode: DiffViewMode }) => void;
  setFiles: (params: { files: FileDiff[] }) => void;
  clearDiff: () => void;
  setWorktreePath: (params: { worktreePath: string | undefined }) => void;
};

const createMockUseDiffReturn = (
  overrides: Partial<UseDiffReturn> = {}
): UseDiffReturn => ({
  files: [],
  selectedFilePath: undefined,
  selectedFileDiff: undefined,
  viewMode: "sideBySide",
  fileTree: [],
  stats: { additions: 0, deletions: 0 },
  selectFile: vi.fn(),
  setViewMode: vi.fn(),
  setFiles: vi.fn(),
  clearDiff: vi.fn(),
  setWorktreePath: vi.fn(),
  ...overrides,
});

const renderWithProviders = (ui: React.ReactElement, store = createStore()) =>
  render(
    <Provider store={store}>
      <I18nProvider i18n={i18n}>{ui}</I18nProvider>
    </Provider>
  );

describe("DiffViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDiff.mockReturnValue(createMockUseDiffReturn());
  });

  it("worktreePath が undefined の場合、変更なし状態を表示する", () => {
    mockUseDiff.mockReturnValue(createMockUseDiffReturn({ files: [] }));

    renderWithProviders(<DiffViewer />);

    expect(screen.getByText("変更はありません")).toBeInTheDocument();
  });

  it("変更ファイルがない場合、変更なし状態を表示する", () => {
    mockUseDiff.mockReturnValue(createMockUseDiffReturn({ files: [] }));

    renderWithProviders(<DiffViewer worktreePath="/path/to/worktree" />);

    expect(screen.getByText("変更はありません")).toBeInTheDocument();
  });

  it("ファイルツリーを表示する", () => {
    const mockFiles = [createMockFileDiff({ path: "src/App.tsx" })];
    const mockFileTree: FileTreeNode[] = [
      { name: "src", path: "src", type: "directory", status: undefined, children: [
        { name: "App.tsx", path: "src/App.tsx", type: "file", status: "modified", children: [] }
      ] }
    ];
    mockUseDiff.mockReturnValue(
      createMockUseDiffReturn({
        files: mockFiles,
        fileTree: mockFileTree,
        selectedFilePath: "src/App.tsx",
        selectedFileDiff: mockFiles[0],
      })
    );

    renderWithProviders(<DiffViewer worktreePath="/path/to/worktree" />);

    expect(screen.getByText("App.tsx")).toBeInTheDocument();
  });

  it("最初のファイルが自動選択される", () => {
    const mockFiles = [
      createMockFileDiff({
        path: "src/App.tsx",
        oldContent: "old app",
        newContent: "new app",
      }),
    ];
    const mockFileTree: FileTreeNode[] = [
      { name: "src", path: "src", type: "directory", status: undefined, children: [
        { name: "App.tsx", path: "src/App.tsx", type: "file", status: "modified", children: [] }
      ] }
    ];
    mockUseDiff.mockReturnValue(
      createMockUseDiffReturn({
        files: mockFiles,
        fileTree: mockFileTree,
        selectedFilePath: "src/App.tsx",
        selectedFileDiff: mockFiles[0],
      })
    );

    renderWithProviders(<DiffViewer worktreePath="/path/to/worktree" />);

    expect(screen.getByTestId("diff-editor")).toBeInTheDocument();
    expect(screen.getByTestId("original-content")).toHaveTextContent("old app");
    expect(screen.getByTestId("modified-content")).toHaveTextContent("new app");
  });

  it("ファイルをクリックするとそのファイルの diff を表示する", async () => {
    const user = userEvent.setup();
    const selectFileMock = vi.fn();
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
    const mockFileTree: FileTreeNode[] = [
      { name: "src", path: "src", type: "directory", status: undefined, children: [
        { name: "App.tsx", path: "src/App.tsx", type: "file", status: "modified", children: [] },
        { name: "utils", path: "src/utils", type: "directory", status: undefined, children: [
          { name: "helper.ts", path: "src/utils/helper.ts", type: "file", status: "modified", children: [] }
        ] }
      ] }
    ];
    mockUseDiff.mockReturnValue(
      createMockUseDiffReturn({
        files: mockFiles,
        fileTree: mockFileTree,
        selectedFilePath: "src/App.tsx",
        selectedFileDiff: mockFiles[0],
        selectFile: selectFileMock,
      })
    );

    renderWithProviders(<DiffViewer worktreePath="/path/to/worktree" />);

    await user.click(screen.getByText("helper.ts"));

    expect(selectFileMock).toHaveBeenCalledWith({
      filePath: "src/utils/helper.ts",
    });
  });

  it("追加/削除の統計を表示する", () => {
    const mockFiles = [
      createMockFileDiff({
        path: "src/App.tsx",
        additions: 10,
        deletions: 3,
      }),
    ];
    const mockFileTree: FileTreeNode[] = [
      { name: "src", path: "src", type: "directory", status: undefined, children: [
        { name: "App.tsx", path: "src/App.tsx", type: "file", status: "modified", children: [] }
      ] }
    ];
    mockUseDiff.mockReturnValue(
      createMockUseDiffReturn({
        files: mockFiles,
        fileTree: mockFileTree,
        selectedFilePath: "src/App.tsx",
        selectedFileDiff: mockFiles[0],
      })
    );

    renderWithProviders(<DiffViewer worktreePath="/path/to/worktree" />);

    expect(screen.getByText("+10")).toBeInTheDocument();
    expect(screen.getByText("-3")).toBeInTheDocument();
  });

  it("ビューモード切替ボタンが表示される", () => {
    const mockFiles = [createMockFileDiff()];
    const mockFileTree: FileTreeNode[] = [
      { name: "src", path: "src", type: "directory", status: undefined, children: [
        { name: "App.tsx", path: "src/App.tsx", type: "file", status: "modified", children: [] }
      ] }
    ];
    mockUseDiff.mockReturnValue(
      createMockUseDiffReturn({
        files: mockFiles,
        fileTree: mockFileTree,
        selectedFilePath: "src/App.tsx",
        selectedFileDiff: mockFiles[0],
      })
    );

    renderWithProviders(<DiffViewer worktreePath="/path/to/worktree" />);

    expect(screen.getByTitle("並列表示")).toBeInTheDocument();
    expect(screen.getByTitle("インライン表示")).toBeInTheDocument();
  });

  it("ファイルの言語が正しく設定される", () => {
    const mockFiles = [
      createMockFileDiff({
        path: "src/App.tsx",
      }),
    ];
    const mockFileTree: FileTreeNode[] = [
      { name: "src", path: "src", type: "directory", status: undefined, children: [
        { name: "App.tsx", path: "src/App.tsx", type: "file", status: "modified", children: [] }
      ] }
    ];
    mockUseDiff.mockReturnValue(
      createMockUseDiffReturn({
        files: mockFiles,
        fileTree: mockFileTree,
        selectedFilePath: "src/App.tsx",
        selectedFileDiff: mockFiles[0],
      })
    );

    renderWithProviders(<DiffViewer worktreePath="/path/to/worktree" />);

    expect(screen.getByTestId("language")).toHaveTextContent("typescript");
  });
});

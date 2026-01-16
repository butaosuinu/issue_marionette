import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "@lingui/react";
import { i18n } from "../../../i18n/config";
import { FileTree } from "../FileTree";
import type { FileTreeNode } from "../../../types/diff";

const createFileNode = (
  overrides: Partial<FileTreeNode> = {}
): FileTreeNode => ({
  name: "test.ts",
  path: "src/test.ts",
  type: "file",
  status: "modified",
  children: [],
  ...overrides,
});

const createDirNode = (
  overrides: Partial<FileTreeNode> = {}
): FileTreeNode => ({
  name: "src",
  path: "src",
  type: "directory",
  status: undefined,
  children: [],
  ...overrides,
});

const renderWithProviders = (ui: React.ReactElement) =>
  render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);

describe("FileTree", () => {
  it("空のノードリストで「変更はありません」を表示する", () => {
    const onSelectFile = vi.fn();
    renderWithProviders(
      <FileTree
        nodes={[]}
        selectedPath={undefined}
        onSelectFile={onSelectFile}
      />
    );

    expect(screen.getByText("変更はありません")).toBeInTheDocument();
  });

  it("ファイルノードを正しく表示する", () => {
    const onSelectFile = vi.fn();
    const nodes: FileTreeNode[] = [
      createFileNode({ name: "App.tsx", path: "App.tsx", status: "added" }),
    ];

    renderWithProviders(
      <FileTree
        nodes={nodes}
        selectedPath={undefined}
        onSelectFile={onSelectFile}
      />
    );

    expect(screen.getByText("App.tsx")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("ディレクトリノードを正しく表示する", () => {
    const onSelectFile = vi.fn();
    const nodes: FileTreeNode[] = [
      createDirNode({
        name: "src",
        path: "src",
        children: [
          createFileNode({ name: "index.ts", path: "src/index.ts" }),
        ],
      }),
    ];

    renderWithProviders(
      <FileTree
        nodes={nodes}
        selectedPath={undefined}
        onSelectFile={onSelectFile}
      />
    );

    expect(screen.getByText("src")).toBeInTheDocument();
    expect(screen.getByText("index.ts")).toBeInTheDocument();
  });

  it("ファイルをクリックすると onSelectFile が呼ばれる", async () => {
    const user = userEvent.setup();
    const onSelectFile = vi.fn();
    const nodes: FileTreeNode[] = [
      createFileNode({ name: "App.tsx", path: "App.tsx" }),
    ];

    renderWithProviders(
      <FileTree
        nodes={nodes}
        selectedPath={undefined}
        onSelectFile={onSelectFile}
      />
    );

    await user.click(screen.getByText("App.tsx"));

    expect(onSelectFile).toHaveBeenCalledWith({ filePath: "App.tsx" });
  });

  it("選択されたファイルがハイライトされる", () => {
    const onSelectFile = vi.fn();
    const nodes: FileTreeNode[] = [
      createFileNode({ name: "App.tsx", path: "App.tsx" }),
      createFileNode({ name: "index.ts", path: "index.ts" }),
    ];

    renderWithProviders(
      <FileTree
        nodes={nodes}
        selectedPath="App.tsx"
        onSelectFile={onSelectFile}
      />
    );

    const selectedButton = screen.getByText("App.tsx").closest("button");
    expect(selectedButton).toHaveClass("bg-gray-700");
  });

  it("ディレクトリを展開/折りたたみできる", async () => {
    const user = userEvent.setup();
    const onSelectFile = vi.fn();
    const nodes: FileTreeNode[] = [
      createDirNode({
        name: "src",
        path: "src",
        children: [
          createFileNode({ name: "index.ts", path: "src/index.ts" }),
        ],
      }),
    ];

    renderWithProviders(
      <FileTree
        nodes={nodes}
        selectedPath={undefined}
        onSelectFile={onSelectFile}
      />
    );

    expect(screen.getByText("index.ts")).toBeInTheDocument();

    await user.click(screen.getByText("src"));
    expect(screen.queryByText("index.ts")).not.toBeInTheDocument();

    await user.click(screen.getByText("src"));
    expect(screen.getByText("index.ts")).toBeInTheDocument();
  });

  it("各ステータスのバッジが正しい色で表示される", () => {
    const onSelectFile = vi.fn();
    const nodes: FileTreeNode[] = [
      createFileNode({ name: "added.ts", path: "added.ts", status: "added" }),
      createFileNode({
        name: "modified.ts",
        path: "modified.ts",
        status: "modified",
      }),
      createFileNode({
        name: "deleted.ts",
        path: "deleted.ts",
        status: "deleted",
      }),
      createFileNode({
        name: "renamed.ts",
        path: "renamed.ts",
        status: "renamed",
      }),
    ];

    renderWithProviders(
      <FileTree
        nodes={nodes}
        selectedPath={undefined}
        onSelectFile={onSelectFile}
      />
    );

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
    expect(screen.getByText("D")).toBeInTheDocument();
    expect(screen.getByText("R")).toBeInTheDocument();
  });
});

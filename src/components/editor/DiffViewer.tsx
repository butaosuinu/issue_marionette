import { Suspense, useEffect } from "react";
import { DiffEditor } from "@monaco-editor/react";
import { useLingui } from "@lingui/react";
import { useDiff } from "../../hooks/useDiff";
import { FileTree } from "./FileTree";
import { ErrorBoundary } from "../error/ErrorBoundary";
import { DIFF_VIEW_MODE, MONACO_DIFF_OPTIONS } from "../../constants/diff";
import { getFileLanguage } from "../../utils/diffParser";
import type { DiffViewMode } from "../../types/diff";
import { Button } from "../ui/Button";

type DiffStatsProps = {
  additions: number;
  deletions: number;
};

const DiffStats = ({ additions, deletions }: DiffStatsProps) => (
  <span className="flex items-center gap-2 text-sm">
    <span className="text-green-500">+{additions}</span>
    <span className="text-red-500">-{deletions}</span>
  </span>
);

type ViewModeToggleProps = {
  viewMode: DiffViewMode;
  onModeChange: (params: { mode: DiffViewMode }) => void;
};

const ViewModeToggle = ({ viewMode, onModeChange }: ViewModeToggleProps) => {
  const { _ } = useLingui();

  const handleSideBySideClick = () => {
    onModeChange({ mode: DIFF_VIEW_MODE.SIDE_BY_SIDE });
  };

  const handleInlineClick = () => {
    onModeChange({ mode: DIFF_VIEW_MODE.INLINE });
  };

  return (
    <div className="flex items-center gap-1 rounded bg-gray-800 p-1">
      <button
        type="button"
        onClick={handleSideBySideClick}
        className={`rounded px-2 py-1 text-xs ${
          viewMode === DIFF_VIEW_MODE.SIDE_BY_SIDE
            ? "bg-gray-600 text-white"
            : "text-gray-400 hover:text-white"
        }`}
        title={_({ id: "diff.viewMode.sideBySide" })}
      >
        |||
      </button>
      <button
        type="button"
        onClick={handleInlineClick}
        className={`rounded px-2 py-1 text-xs ${
          viewMode === DIFF_VIEW_MODE.INLINE
            ? "bg-gray-600 text-white"
            : "text-gray-400 hover:text-white"
        }`}
        title={_({ id: "diff.viewMode.inline" })}
      >
        ≡
      </button>
    </div>
  );
};

const LoadingState = () => {
  const { _ } = useLingui();
  return (
    <div className="flex h-full items-center justify-center text-gray-400">
      {_({ id: "diff.loading" })}
    </div>
  );
};

type DiffErrorFallbackProps = {
  error: Error;
  reset: () => void;
};

const DiffErrorFallback = ({ error, reset }: DiffErrorFallbackProps) => {
  const { _ } = useLingui();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-red-400">
      <span>{_({ id: "diff.error" })}</span>
      <span className="text-sm text-gray-500">{error.message}</span>
      <Button variant="secondary" onClick={reset}>
        再試行
      </Button>
    </div>
  );
};

const EmptyState = () => {
  const { _ } = useLingui();
  return (
    <div className="flex h-full items-center justify-center text-gray-500">
      {_({ id: "diff.noChanges" })}
    </div>
  );
};

type DiffViewerContentProps = {
  worktreePath: string | undefined;
};

const DiffViewerContent = ({ worktreePath }: DiffViewerContentProps) => {
  const {
    files,
    selectedFilePath,
    selectedFileDiff,
    viewMode,
    fileTree,
    selectFile,
    setViewMode,
    setWorktreePath,
  } = useDiff();

  useEffect(() => {
    setWorktreePath({ worktreePath });
  }, [worktreePath, setWorktreePath]);

  if (files.length === 0) {
    return <EmptyState />;
  }

  const language =
    selectedFilePath === undefined
      ? "plaintext"
      : getFileLanguage({ filePath: selectedFilePath });

  const renderSideBySide = viewMode === DIFF_VIEW_MODE.SIDE_BY_SIDE;

  return (
    <div className="flex h-full">
      <div className="w-64 overflow-y-auto border-r border-gray-700">
        <FileTree
          nodes={fileTree}
          selectedPath={selectedFilePath}
          onSelectFile={selectFile}
        />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300">{selectedFilePath}</span>
            {selectedFileDiff !== undefined && (
              <DiffStats
                additions={selectedFileDiff.additions}
                deletions={selectedFileDiff.deletions}
              />
            )}
          </div>
          <ViewModeToggle viewMode={viewMode} onModeChange={setViewMode} />
        </div>

        <div className="flex-1">
          {selectedFileDiff !== undefined && (
            <DiffEditor
              original={selectedFileDiff.oldContent}
              modified={selectedFileDiff.newContent}
              language={language}
              options={{
                ...MONACO_DIFF_OPTIONS,
                renderSideBySide,
              }}
              theme="vs-dark"
            />
          )}
        </div>
      </div>
    </div>
  );
};

type DiffViewerProps = {
  worktreePath?: string;
};

export const DiffViewer = ({ worktreePath }: DiffViewerProps) => (
  <ErrorBoundary fallback={DiffErrorFallback}>
    <Suspense fallback={<LoadingState />}>
      <DiffViewerContent worktreePath={worktreePath} />
    </Suspense>
  </ErrorBoundary>
);

import { useCallback, useState } from "react";
import type { Worktree } from "../../types/worktree";

const BRANCH_NAME_MAX_LENGTH = 30;

type WorktreeSetupPanelProps = {
  repoPath: string;
  issueNumber: number;
  issueTitle: string;
  existingWorktrees: Worktree[];
  isLoading: boolean;
  onCreateWorktree: (params: { branchName: string }) => void;
  onSelectExistingWorktree: (worktree: Worktree) => void;
};

const generateDefaultBranchName = (issueNumber: number, issueTitle: string): string => {
  const sanitizedTitle = issueTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, BRANCH_NAME_MAX_LENGTH);
  return `feature/issue-${issueNumber}-${sanitizedTitle}`;
};

export const WorktreeSetupPanel = ({
  repoPath,
  issueNumber,
  issueTitle,
  existingWorktrees,
  isLoading,
  onCreateWorktree,
  onSelectExistingWorktree,
}: WorktreeSetupPanelProps) => {
  const defaultBranchName = generateDefaultBranchName(issueNumber, issueTitle);
  const [branchName, setBranchName] = useState(defaultBranchName);

  const issueWorktree = existingWorktrees.find(
    (w) => w.issue_number === issueNumber
  );

  const handleCreate = useCallback(() => {
    if (branchName.trim() === "") {
      return;
    }
    onCreateWorktree({ branchName });
  }, [branchName, onCreateWorktree]);

  const handleBranchNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setBranchName(event.target.value);
    },
    []
  );

  const handleSelectExisting = useCallback(() => {
    if (issueWorktree !== undefined) {
      onSelectExistingWorktree(issueWorktree);
    }
  }, [issueWorktree, onSelectExistingWorktree]);

  if (issueWorktree !== undefined) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
        <h3 className="mb-2 text-sm font-medium text-gray-200">
          既存のWorktreeを使用
        </h3>
        <p className="mb-3 text-sm text-gray-400">
          このIssue用のWorktreeが既に存在します。
        </p>
        <div className="mb-3 rounded border border-gray-600 bg-gray-900 p-3">
          <p className="text-sm text-gray-300">
            <span className="text-gray-500">パス: </span>
            {issueWorktree.path}
          </p>
          <p className="text-sm text-gray-300">
            <span className="text-gray-500">ブランチ: </span>
            {issueWorktree.branch_name}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSelectExisting}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          このWorktreeを使用
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
      <h3 className="mb-2 text-sm font-medium text-gray-200">
        Worktreeの作成
      </h3>
      <p className="mb-3 text-sm text-gray-400">
        このIssue用のWorktreeを作成して作業を開始します。
      </p>

      <div className="mb-3">
        <label
          htmlFor="branch-name"
          className="mb-1 block text-sm text-gray-400"
        >
          ブランチ名:
        </label>
        <input
          id="branch-name"
          type="text"
          value={branchName}
          onChange={handleBranchNameChange}
          className="w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-gray-200"
          placeholder="feature/issue-123-description"
        />
      </div>

      <div className="mb-3 text-xs text-gray-500">
        <p>リポジトリ: {repoPath}</p>
      </div>

      <button
        type="button"
        onClick={handleCreate}
        disabled={isLoading || branchName.trim() === ""}
        className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "作成中..." : "Worktreeを作成"}
      </button>
    </div>
  );
};

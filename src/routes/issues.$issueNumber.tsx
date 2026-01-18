import { createFileRoute, Link } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo } from "react";
import { issuesAtom } from "../stores/issueAtoms";
import { selectedRepositoryAtom } from "../stores/repositoryAtoms";
import { WorktreeSetupPanel } from "../components/agent/WorktreeSetupPanel";
import { AgentSessionView } from "../components/agent/AgentSessionView";
import { useWorktree } from "../hooks/useWorktree";

export const Route = createFileRoute("/issues/$issueNumber")({
  component: IssueDetailPage,
});

function IssueDetailPage() {
  const { issueNumber } = Route.useParams();
  const issueNumberInt = parseInt(issueNumber, 10);

  const issues = useAtomValue(issuesAtom);
  const selectedRepository = useAtomValue(selectedRepositoryAtom);

  const {
    worktrees,
    activeWorktree,
    isLoading: isWorktreeLoading,
    listWorktrees,
    createWorktree,
    setActiveWorktree,
  } = useWorktree();

  const issue = useMemo(
    () => issues.find((i) => i.number === issueNumberInt),
    [issues, issueNumberInt]
  );

  useEffect(() => {
    if (selectedRepository === undefined) {
      return;
    }
    void listWorktrees({ repoPath: selectedRepository.local_path });
  }, [selectedRepository, listWorktrees]);

  useEffect(() => {
    const worktreeForIssue = worktrees.find(
      (w) => w.issue_number === issueNumberInt
    );
    if (worktreeForIssue !== undefined && activeWorktree === undefined) {
      setActiveWorktree(worktreeForIssue.id);
    }
  }, [worktrees, issueNumberInt, activeWorktree, setActiveWorktree]);

  const handleCreateWorktree = useCallback(
    async ({ branchName }: { branchName: string }) => {
      if (selectedRepository === undefined) {
        return;
      }
      await createWorktree({
        repoPath: selectedRepository.local_path,
        issueNumber: issueNumberInt,
        branchName,
      });
    },
    [selectedRepository, issueNumberInt, createWorktree]
  );

  const handleSelectExistingWorktree = useCallback(
    (worktree: { id: string }) => {
      setActiveWorktree(worktree.id);
    },
    [setActiveWorktree]
  );

  const issueContext = useMemo(() => {
    if (issue === undefined) {
      return "";
    }
    return `Issue #${issue.number}: ${issue.title}\n\n${issue.body}`;
  }, [issue]);

  if (issue === undefined) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <p className="text-gray-400">Issue #{issueNumber} が見つかりません</p>
        <Link
          to="/"
          className="mt-4 text-blue-500 hover:text-blue-400 hover:underline"
        >
          カンバンに戻る
        </Link>
      </div>
    );
  }

  if (selectedRepository === undefined) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <p className="text-gray-400">リポジトリを選択してください</p>
        <Link
          to="/"
          className="mt-4 text-blue-500 hover:text-blue-400 hover:underline"
        >
          カンバンに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden p-4">
      <div className="mb-4 flex items-center gap-4">
        <Link
          to="/"
          className="text-gray-400 hover:text-gray-200"
        >
          ← カンバン
        </Link>
        <h1 className="text-lg font-bold text-gray-100">
          Issue #{issue.number}
        </h1>
      </div>

      <div className="mb-4 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <h2 className="mb-2 text-xl font-semibold text-gray-100">
          {issue.title}
        </h2>
        {issue.body !== "" && (
          <p className="whitespace-pre-wrap text-sm text-gray-400">
            {issue.body}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {issue.labels.map((label) => (
            <span
              key={label.id}
              className="rounded px-2 py-0.5 text-xs"
              style={{
                backgroundColor: `${label.color}30`,
                color: label.color,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      </div>

      {activeWorktree === undefined ? (
        <WorktreeSetupPanel
          repoPath={selectedRepository.local_path}
          issueNumber={issueNumberInt}
          issueTitle={issue.title}
          existingWorktrees={worktrees}
          isLoading={isWorktreeLoading}
          onCreateWorktree={handleCreateWorktree}
          onSelectExistingWorktree={handleSelectExistingWorktree}
        />
      ) : (
        <div className="min-h-0 flex-1">
          <AgentSessionView
            worktreePath={activeWorktree.path}
            issueContext={issueContext}
          />
        </div>
      )}
    </div>
  );
}

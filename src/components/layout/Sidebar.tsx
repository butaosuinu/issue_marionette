import { Link } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { RepositorySelector } from "../repository/RepositorySelector";
import { runningSessionsAtom } from "../../stores/agentAtoms";
import { worktreesAtom } from "../../stores/worktreeAtoms";
import { AGENT_STATUS_LABELS } from "../../constants/agent";
import { StatusDot } from "../ui/StatusDot";

const SESSION_ID_DISPLAY_LENGTH = 8;

export const Sidebar = () => {
  const runningSessions = useAtomValue(runningSessionsAtom);
  const worktrees = useAtomValue(worktreesAtom);

  const sessionsWithIssue = runningSessions.map((session) => {
    const worktree = worktrees.find((w) => w.path === session.worktree_path);
    return {
      session,
      issueNumber: worktree?.issue_number,
    };
  });

  return (
    <aside className="flex w-60 flex-col border-r border-gray-700 bg-gray-800">
      <div className="flex-1 overflow-y-auto p-2">
        <nav className="space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2 rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100 [&.active]:bg-gray-700 [&.active]:text-gray-100"
          >
            <span>📋</span>
            <span>カンバン</span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-2 rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100 [&.active]:bg-gray-700 [&.active]:text-gray-100"
          >
            <span>⚙️</span>
            <span>設定</span>
          </Link>
        </nav>

        {sessionsWithIssue.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-gray-500">
              実行中のセッション
            </h3>
            <nav className="space-y-1">
              {sessionsWithIssue.map(({ session, issueNumber }) =>
                issueNumber === undefined ? (
                  <Link
                    key={session.id}
                    to="/"
                    className="flex items-center gap-2 rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100 [&.active]:bg-gray-700 [&.active]:text-gray-100"
                  >
                    <StatusDot color="#22c55e" />
                    <span>{session.id.slice(0, SESSION_ID_DISPLAY_LENGTH)}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {AGENT_STATUS_LABELS[session.status]}
                    </span>
                  </Link>
                ) : (
                  <Link
                    key={session.id}
                    to="/issues/$issueNumber"
                    params={{ issueNumber: String(issueNumber) }}
                    className="flex items-center gap-2 rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100 [&.active]:bg-gray-700 [&.active]:text-gray-100"
                  >
                    <StatusDot color="#22c55e" />
                    <span>#{issueNumber}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {AGENT_STATUS_LABELS[session.status]}
                    </span>
                  </Link>
                )
              )}
            </nav>
          </div>
        )}
      </div>
      <div className="border-t border-gray-700 p-2">
        <RepositorySelector />
      </div>
    </aside>
  );
};

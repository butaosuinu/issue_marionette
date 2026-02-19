import { useCallback, useState } from "react";
import type { AgentMode, AgentStatus } from "../../types/agent";
import { AGENT_MODE, AGENT_MODE_LABELS, AGENT_STATUS_LABELS } from "../../constants/agent";
import { Button } from "../ui/Button";
import { StatusDot } from "../ui/StatusDot";

type AgentControlPanelProps = {
  worktreePath: string | undefined;
  isAgentRunning: boolean;
  agentStatus: AgentStatus | undefined;
  onStart: (params: { mode: AgentMode }) => void | Promise<void>;
  onStop: () => void | Promise<void>;
};

const STATUS_COLORS: Record<AgentStatus, string> = {
  starting: "#eab308",
  running: "#22c55e",
  waiting: "#3b82f6",
  completed: "#6b7280",
  error: "#ef4444",
};

export const AgentControlPanel = ({
  worktreePath,
  isAgentRunning,
  agentStatus,
  onStart,
  onStop,
}: AgentControlPanelProps) => {
  const [selectedMode, setSelectedMode] = useState<AgentMode>(AGENT_MODE.ACT);

  const handleStart = useCallback(() => {
    void onStart({ mode: selectedMode });
  }, [onStart, selectedMode]);

  const handleStop = useCallback(() => {
    void onStop();
  }, [onStop]);

  const handleModeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      if (value === AGENT_MODE.PLAN || value === AGENT_MODE.ACT) {
        setSelectedMode(value);
      }
    },
    []
  );

  const isStartDisabled = worktreePath === undefined || isAgentRunning;

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-700 bg-gray-800 p-4">
      <div className="flex items-center gap-2">
        <label htmlFor="agent-mode" className="text-sm text-gray-400">
          モード:
        </label>
        <select
          id="agent-mode"
          value={selectedMode}
          onChange={handleModeChange}
          disabled={isAgentRunning}
          className="rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-gray-200 disabled:opacity-50"
        >
          <option value={AGENT_MODE.ACT}>{AGENT_MODE_LABELS.act}</option>
          <option value={AGENT_MODE.PLAN}>{AGENT_MODE_LABELS.plan}</option>
        </select>
      </div>

      {isAgentRunning ? (
        <Button variant="danger" onClick={handleStop}>
          停止
        </Button>
      ) : (
        <Button onClick={handleStart} disabled={isStartDisabled}>
          Agent 起動
        </Button>
      )}

      {agentStatus !== undefined && (
        <div className="flex items-center gap-2">
          <StatusDot color={STATUS_COLORS[agentStatus]} />
          <span className="text-sm text-gray-300">
            {AGENT_STATUS_LABELS[agentStatus]}
          </span>
        </div>
      )}

      {worktreePath === undefined && (
        <span className="text-sm text-yellow-500">
          Worktreeを先に作成してください
        </span>
      )}
    </div>
  );
};

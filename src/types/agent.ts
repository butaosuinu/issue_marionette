export type AgentMode = "plan" | "act";

export type AgentStatus =
  | "starting"
  | "running"
  | "waiting"
  | "completed"
  | "error";

export type AgentSession = {
  id: string;
  worktree_path: string;
  mode: AgentMode;
  status: AgentStatus;
  started_at: string;
  completed_at: string | undefined;
};

export type AgentOutputPayload = {
  session_id: string;
  data: number[];
};

export type AgentStatusPayload = {
  session_id: string;
  status: AgentStatus;
};

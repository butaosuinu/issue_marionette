import type { AgentMode, AgentStatus } from "../types/agent";
import type { WorktreeStatus } from "../types/worktree";

export const AGENT_MODE = Object.freeze({
  PLAN: "plan",
  ACT: "act",
}) satisfies Readonly<Record<string, AgentMode>>;

export const AGENT_STATUS = Object.freeze({
  STARTING: "starting",
  RUNNING: "running",
  WAITING: "waiting",
  COMPLETED: "completed",
  ERROR: "error",
}) satisfies Readonly<Record<string, AgentStatus>>;

export const WORKTREE_STATUS = Object.freeze({
  CREATING: "creating",
  READY: "ready",
  WORKING: "working",
  REVIEWING: "reviewing",
  MERGED: "merged",
}) satisfies Readonly<Record<string, WorktreeStatus>>;

export const AGENT_STATUS_LABELS = Object.freeze({
  starting: "起動中",
  running: "実行中",
  waiting: "待機中",
  completed: "完了",
  error: "エラー",
}) satisfies Readonly<Record<AgentStatus, string>>;

export const AGENT_MODE_LABELS = Object.freeze({
  plan: "計画モード",
  act: "実行モード",
}) satisfies Readonly<Record<AgentMode, string>>;

export const AGENT_EVENTS = Object.freeze({
  OUTPUT: "agent-output" as const,
  STATUS_CHANGED: "agent-status-changed" as const,
});

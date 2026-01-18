export type TerminalSessionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export type TerminalSession = {
  id: string;
  workingDir: string;
  status: TerminalSessionStatus;
  createdAt: number;
};

export type TerminalTab = {
  id: string;
  label: string;
  sessionId: string | undefined;
  isActive: boolean;
};

export type TerminalState = {
  tabs: TerminalTab[];
  activeTabId: string | undefined;
  sessions: Record<string, TerminalSession>;
};

export type PtyOutputPayload = {
  session_id: string;
  data: number[];
};

export type TerminalSize = {
  cols: number;
  rows: number;
};

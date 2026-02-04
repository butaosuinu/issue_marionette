import { useCallback } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { invokeWithResult } from "../utils/invoke";
import {
  activeSessionAtom,
  activeSessionIdAtom,
  sessionsAtom,
  runningSessionsAtom,
  isAgentRunningAtom,
  setActiveSessionAtom,
  addSessionAtom,
  updateSessionStatusAtom,
  removeSessionAtom,
} from "../stores/agentAtoms";
import type { AgentSession, AgentMode, AgentStatus } from "../types/agent";
import type { TerminalSize } from "../types/terminal";

type StartAgentParams = {
  worktreePath: string;
  issueContext: string;
  mode: AgentMode;
};

type UseAgentReturn = {
  activeSession: AgentSession | undefined;
  activeSessionId: string | undefined;
  sessions: AgentSession[];
  runningSessions: AgentSession[];
  isAgentRunning: boolean;
  startAgent: (params: StartAgentParams) => Promise<AgentSession | undefined>;
  stopAgent: (params: { sessionId: string }) => Promise<void>;
  sendInput: (params: { sessionId: string; input: string }) => Promise<void>;
  getStatus: (params: { sessionId: string }) => Promise<AgentStatus | undefined>;
  setActiveSession: (sessionId: string | undefined) => void;
  resizeAgent: (params: { sessionId: string; size: TerminalSize }) => Promise<void>;
};

export const useAgent = (): UseAgentReturn => {
  const activeSession = useAtomValue(activeSessionAtom);
  const activeSessionId = useAtomValue(activeSessionIdAtom);
  const sessions = useAtomValue(sessionsAtom);
  const runningSessions = useAtomValue(runningSessionsAtom);
  const isAgentRunning = useAtomValue(isAgentRunningAtom);

  const doSetActiveSession = useSetAtom(setActiveSessionAtom);
  const doAddSession = useSetAtom(addSessionAtom);
  const doUpdateSessionStatus = useSetAtom(updateSessionStatusAtom);
  const doRemoveSession = useSetAtom(removeSessionAtom);

  const startAgent = useCallback(
    async ({
      worktreePath,
      issueContext,
      mode,
    }: StartAgentParams): Promise<AgentSession | undefined> => {
      const result = await invokeWithResult<AgentSession>("start_agent", {
        worktree_path: worktreePath,
        issue_context: issueContext,
        mode,
      });

      if (!result.ok) {
        return undefined;
      }

      doAddSession(result.data);
      return result.data;
    },
    [doAddSession]
  );

  const stopAgent = useCallback(
    async ({ sessionId }: { sessionId: string }): Promise<void> => {
      const result = await invokeWithResult<undefined>("stop_agent", {
        session_id: sessionId,
      });

      if (result.ok) {
        doRemoveSession(sessionId);
      }
    },
    [doRemoveSession]
  );

  const sendInput = useCallback(
    async ({
      sessionId,
      input,
    }: {
      sessionId: string;
      input: string;
    }): Promise<void> => {
      await invokeWithResult<undefined>("send_agent_input", {
        session_id: sessionId,
        input,
      });
    },
    []
  );

  const getStatus = useCallback(
    async ({
      sessionId,
    }: {
      sessionId: string;
    }): Promise<AgentStatus | undefined> => {
      const result = await invokeWithResult<AgentStatus>("get_agent_status", {
        session_id: sessionId,
      });

      if (!result.ok) {
        return undefined;
      }

      doUpdateSessionStatus({ sessionId, status: result.data });
      return result.data;
    },
    [doUpdateSessionStatus]
  );

  const setActiveSession = useCallback(
    (sessionId: string | undefined) => {
      doSetActiveSession(sessionId);
    },
    [doSetActiveSession]
  );

  const resizeAgent = useCallback(
    async ({
      sessionId,
      size,
    }: {
      sessionId: string;
      size: TerminalSize;
    }): Promise<void> => {
      await invokeWithResult<undefined>("resize_agent", {
        session_id: sessionId,
        cols: size.cols,
        rows: size.rows,
      });
    },
    []
  );

  return {
    activeSession,
    activeSessionId,
    sessions,
    runningSessions,
    isAgentRunning,
    startAgent,
    stopAgent,
    sendInput,
    getStatus,
    setActiveSession,
    resizeAgent,
  };
};

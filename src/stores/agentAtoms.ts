import { atom } from "jotai";
import type { AgentSession, AgentStatus } from "../types/agent";
import { AGENT_STATUS } from "../constants/agent";

export type AgentState = {
  sessions: Record<string, AgentSession>;
  activeSessionId: string | undefined;
};

const DEFAULT_AGENT_STATE: AgentState = {
  sessions: {},
  activeSessionId: undefined,
};

export const agentStateAtom = atom<AgentState>(DEFAULT_AGENT_STATE);

export const activeSessionIdAtom = atom<string | undefined>(
  (get) => get(agentStateAtom).activeSessionId
);

export const activeSessionAtom = atom<AgentSession | undefined>((get) => {
  const state = get(agentStateAtom);
  if (state.activeSessionId === undefined) {
    return undefined;
  }
  return state.sessions[state.activeSessionId];
});

export const sessionsAtom = atom<AgentSession[]>((get) =>
  Object.values(get(agentStateAtom).sessions)
);

export const runningSessionsAtom = atom<AgentSession[]>((get) => {
  const sessions = get(sessionsAtom);
  return sessions.filter(
    (session) =>
      session.status === AGENT_STATUS.STARTING ||
      session.status === AGENT_STATUS.RUNNING ||
      session.status === AGENT_STATUS.WAITING
  );
});

export const isAgentRunningAtom = atom<boolean>((get) => {
  const activeSession = get(activeSessionAtom);
  if (activeSession === undefined) {
    return false;
  }
  return (
    activeSession.status === AGENT_STATUS.STARTING ||
    activeSession.status === AGENT_STATUS.RUNNING ||
    activeSession.status === AGENT_STATUS.WAITING
  );
});

export const setActiveSessionAtom = atom(
  null,
  (get, set, sessionId: string | undefined) => {
    const state = get(agentStateAtom);
    set(agentStateAtom, {
      ...state,
      activeSessionId: sessionId,
    });
  }
);

export const addSessionAtom = atom(null, (get, set, session: AgentSession) => {
  const state = get(agentStateAtom);
  set(agentStateAtom, {
    ...state,
    sessions: {
      ...state.sessions,
      [session.id]: session,
    },
    activeSessionId: session.id,
  });
});

export const updateSessionStatusAtom = atom(
  null,
  (
    get,
    set,
    payload: {
      sessionId: string;
      status: AgentStatus;
    }
  ) => {
    const state = get(agentStateAtom);
    if (!(payload.sessionId in state.sessions)) {
      return;
    }
    const session = state.sessions[payload.sessionId];
    set(agentStateAtom, {
      ...state,
      sessions: {
        ...state.sessions,
        [payload.sessionId]: {
          ...session,
          status: payload.status,
          completed_at:
            payload.status === AGENT_STATUS.COMPLETED ||
            payload.status === AGENT_STATUS.ERROR
              ? new Date().toISOString()
              : session.completed_at,
        },
      },
    });
  }
);

export const removeSessionAtom = atom(
  null,
  (get, set, sessionId: string) => {
    const state = get(agentStateAtom);
    const { [sessionId]: _, ...remainingSessions } = state.sessions;
    const newActiveSessionId =
      state.activeSessionId === sessionId ? undefined : state.activeSessionId;
    set(agentStateAtom, {
      ...state,
      sessions: remainingSessions,
      activeSessionId: newActiveSessionId,
    });
  }
);

export const clearAgentStateAtom = atom(null, (_get, set) => {
  set(agentStateAtom, DEFAULT_AGENT_STATE);
});

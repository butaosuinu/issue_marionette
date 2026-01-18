import { atom } from "jotai";
import type {
  TerminalState,
  TerminalTab,
  TerminalSession,
} from "../types/terminal";
import {
  DEFAULT_TERMINAL_STATE,
  TAB_ID_PREFIX,
  TAB_LABEL_PREFIX,
  ARRAY_INDEX,
} from "../constants/terminal";

export const terminalStateAtom = atom<TerminalState>(DEFAULT_TERMINAL_STATE);

export const tabsAtom = atom<TerminalTab[]>(
  (get) => get(terminalStateAtom).tabs
);

export const activeTabIdAtom = atom<string | undefined>(
  (get) => get(terminalStateAtom).activeTabId
);

export const activeTabAtom = atom<TerminalTab | undefined>((get) => {
  const { tabs, activeTabId } = get(terminalStateAtom);
  if (activeTabId === undefined) {
    return undefined;
  }
  return tabs.find((tab) => tab.id === activeTabId);
});

export const activeSessionAtom = atom<TerminalSession | undefined>((get) => {
  const state = get(terminalStateAtom);
  const activeTab = get(activeTabAtom);
  if (activeTab?.sessionId === undefined) {
    return undefined;
  }
  return state.sessions[activeTab.sessionId];
});

export const tabCountAtom = atom<number>(
  (get) => get(terminalStateAtom).tabs.length
);

export const addTabAtom = atom(null, (get, set) => {
  const state = get(terminalStateAtom);
  const nextCounter = state.tabCounter + 1;
  const tabId = `${TAB_ID_PREFIX}${Date.now()}`;
  const newTab: TerminalTab = {
    id: tabId,
    label: `${TAB_LABEL_PREFIX}${nextCounter}`,
    sessionId: undefined,
    isActive: true,
  };
  const updatedTabs = state.tabs.map((tab) => ({ ...tab, isActive: false }));
  set(terminalStateAtom, {
    ...state,
    tabs: [...updatedTabs, newTab],
    activeTabId: tabId,
    tabCounter: nextCounter,
  });
  return tabId;
});

export const removeTabAtom = atom(null, (get, set, tabId: string) => {
  const state = get(terminalStateAtom);
  const tabIndex = state.tabs.findIndex((tab) => tab.id === tabId);
  if (tabIndex === ARRAY_INDEX.NOT_FOUND) {
    return;
  }

  const tabToRemove = state.tabs[tabIndex];
  const updatedTabs = state.tabs.filter((tab) => tab.id !== tabId);

  const sessionIdToRemove = tabToRemove.sessionId;
  const updatedSessions =
    sessionIdToRemove === undefined
      ? state.sessions
      : Object.fromEntries(
          Object.entries(state.sessions).filter(
            ([key]) => key !== sessionIdToRemove
          )
        );

  const newActiveTabId =
    updatedTabs.length > 0
      ? updatedTabs[Math.min(tabIndex, updatedTabs.length - 1)].id
      : undefined;

  set(terminalStateAtom, {
    ...state,
    tabs: updatedTabs.map((tab) => ({
      ...tab,
      isActive: tab.id === newActiveTabId,
    })),
    activeTabId: newActiveTabId,
    sessions: updatedSessions,
  });
});

export const setActiveTabAtom = atom(null, (get, set, tabId: string) => {
  const state = get(terminalStateAtom);
  set(terminalStateAtom, {
    ...state,
    tabs: state.tabs.map((tab) => ({
      ...tab,
      isActive: tab.id === tabId,
    })),
    activeTabId: tabId,
  });
});

export const setSessionForTabAtom = atom(
  null,
  (
    get,
    set,
    payload: {
      tabId: string;
      session: TerminalSession;
    }
  ) => {
    const state = get(terminalStateAtom);
    set(terminalStateAtom, {
      ...state,
      tabs: state.tabs.map((tab) =>
        tab.id === payload.tabId
          ? { ...tab, sessionId: payload.session.id }
          : tab
      ),
      sessions: {
        ...state.sessions,
        [payload.session.id]: payload.session,
      },
    });
  }
);

export const updateSessionStatusAtom = atom(
  null,
  (
    get,
    set,
    payload: {
      sessionId: string;
      status: TerminalSession["status"];
    }
  ) => {
    const state = get(terminalStateAtom);
    if (!(payload.sessionId in state.sessions)) {
      return;
    }
    const session = state.sessions[payload.sessionId];

    set(terminalStateAtom, {
      ...state,
      sessions: {
        ...state.sessions,
        [payload.sessionId]: { ...session, status: payload.status },
      },
    });
  }
);

export const clearTerminalStateAtom = atom(null, (_get, set) => {
  set(terminalStateAtom, DEFAULT_TERMINAL_STATE);
});

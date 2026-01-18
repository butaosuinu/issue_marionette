import { useCallback } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { invokeWithResult } from "../utils/invoke";
import {
  tabsAtom,
  activeTabIdAtom,
  activeTabAtom,
  activeSessionAtom,
  tabCountAtom,
  addTabAtom,
  removeTabAtom,
  setActiveTabAtom,
  setSessionForTabAtom,
  updateSessionStatusAtom,
} from "../stores/terminalAtoms";
import {
  DEFAULT_TERMINAL_SIZE,
  TERMINAL_SESSION_STATUS,
} from "../constants/terminal";
import type {
  TerminalTab,
  TerminalSession,
  TerminalSize,
} from "../types/terminal";

type UseTerminalReturn = {
  tabs: TerminalTab[];
  activeTabId: string | undefined;
  activeTab: TerminalTab | undefined;
  activeSession: TerminalSession | undefined;
  tabCount: number;
  createTab: () => string;
  closeTab: (params: { tabId: string }) => Promise<void>;
  switchTab: (params: { tabId: string }) => void;
  createSession: (params: {
    tabId: string;
    workingDir: string;
    size?: TerminalSize;
  }) => Promise<string | undefined>;
  writeToSession: (params: { sessionId: string; data: string }) => Promise<void>;
  resizeSession: (params: {
    sessionId: string;
    size: TerminalSize;
  }) => Promise<void>;
  closeSession: (params: { sessionId: string }) => Promise<void>;
};

export const useTerminal = (): UseTerminalReturn => {
  const tabs = useAtomValue(tabsAtom);
  const activeTabId = useAtomValue(activeTabIdAtom);
  const activeTab = useAtomValue(activeTabAtom);
  const activeSession = useAtomValue(activeSessionAtom);
  const tabCount = useAtomValue(tabCountAtom);

  const doAddTab = useSetAtom(addTabAtom);
  const doRemoveTab = useSetAtom(removeTabAtom);
  const doSetActiveTab = useSetAtom(setActiveTabAtom);
  const doSetSessionForTab = useSetAtom(setSessionForTabAtom);
  const doUpdateSessionStatus = useSetAtom(updateSessionStatusAtom);

  const createTab = useCallback(() => doAddTab(), [doAddTab]);

  const createSession = useCallback(
    async ({
      tabId,
      workingDir,
      size = DEFAULT_TERMINAL_SIZE,
    }: {
      tabId: string;
      workingDir: string;
      size?: TerminalSize;
    }): Promise<string | undefined> => {
      const result = await invokeWithResult<string>("create_pty_session", {
        working_dir: workingDir,
        cols: size.cols,
        rows: size.rows,
      });

      if (!result.ok) {
        return undefined;
      }

      const session: TerminalSession = {
        id: result.data,
        workingDir,
        status: TERMINAL_SESSION_STATUS.CONNECTED,
        createdAt: Date.now(),
      };

      doSetSessionForTab({ tabId, session });
      return result.data;
    },
    [doSetSessionForTab]
  );

  const writeToSession = useCallback(
    async ({ sessionId, data }: { sessionId: string; data: string }) => {
      const encoder = new TextEncoder();
      const bytes = Array.from(encoder.encode(data));
      await invokeWithResult<undefined>("write_pty", {
        session_id: sessionId,
        data: bytes,
      });
    },
    []
  );

  const resizeSession = useCallback(
    async ({
      sessionId,
      size,
    }: {
      sessionId: string;
      size: TerminalSize;
    }) => {
      await invokeWithResult<undefined>("resize_pty", {
        session_id: sessionId,
        cols: size.cols,
        rows: size.rows,
      });
    },
    []
  );

  const closeSession = useCallback(
    async ({ sessionId }: { sessionId: string }) => {
      await invokeWithResult<undefined>("close_pty", { session_id: sessionId });
      doUpdateSessionStatus({
        sessionId,
        status: TERMINAL_SESSION_STATUS.DISCONNECTED,
      });
    },
    [doUpdateSessionStatus]
  );

  const closeTab = useCallback(
    async ({ tabId }: { tabId: string }) => {
      const tabToClose = tabs.find((tab) => tab.id === tabId);
      if (tabToClose?.sessionId !== undefined) {
        await closeSession({ sessionId: tabToClose.sessionId });
      }
      doRemoveTab(tabId);
    },
    [tabs, closeSession, doRemoveTab]
  );

  const switchTab = useCallback(
    ({ tabId }: { tabId: string }) => {
      doSetActiveTab(tabId);
    },
    [doSetActiveTab]
  );

  return {
    tabs,
    activeTabId,
    activeTab,
    activeSession,
    tabCount,
    createTab,
    closeTab,
    switchTab,
    createSession,
    writeToSession,
    resizeSession,
    closeSession,
  };
};

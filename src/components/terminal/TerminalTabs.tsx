import { useCallback } from "react";
import { Terminal } from "./Terminal";
import { useTerminal } from "../../hooks/useTerminal";
import {
  TERMINAL_TAB_LIMIT,
  TERMINAL_STYLES,
} from "../../constants/terminal";
import type { TerminalTab, TerminalSize } from "../../types/terminal";

type TabProps = {
  tab: TerminalTab;
  onSelect: () => void;
  onClose: () => void;
};

const Tab = ({ tab, onSelect, onClose }: TabProps) => {
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={`${TERMINAL_STYLES.tabButton} ${
        tab.isActive ? TERMINAL_STYLES.tabActive : TERMINAL_STYLES.tabInactive
      }`}
    >
      <span>{tab.label}</span>
      <button
        type="button"
        onClick={handleCloseClick}
        className={TERMINAL_STYLES.closeButton}
        aria-label="Close tab"
      >
        <span className="text-xs">×</span>
      </button>
    </div>
  );
};

type NewTabButtonProps = {
  onClick: () => void;
  disabled: boolean;
};

const NewTabButton = ({ onClick, disabled }: NewTabButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={TERMINAL_STYLES.newTabButton}
    title="New Terminal"
  >
    +
  </button>
);

type TabBarProps = {
  tabs: TerminalTab[];
  onSelectTab: (params: { tabId: string }) => void;
  onCloseTab: (params: { tabId: string }) => void;
  onNewTab: () => void;
  canAddTab: boolean;
};

const TabBar = ({
  tabs,
  onSelectTab,
  onCloseTab,
  onNewTab,
  canAddTab,
}: TabBarProps) => (
  <div className={TERMINAL_STYLES.tabBar}>
    {tabs.map((tab) => (
      <Tab
        key={tab.id}
        tab={tab}
        onSelect={() => {
          onSelectTab({ tabId: tab.id });
        }}
        onClose={() => {
          onCloseTab({ tabId: tab.id });
        }}
      />
    ))}
    <NewTabButton onClick={onNewTab} disabled={!canAddTab} />
  </div>
);

type EmptyStateProps = {
  onCreateTab: () => void;
};

const EmptyState = ({ onCreateTab }: EmptyStateProps) => (
  <div className={TERMINAL_STYLES.emptyState}>
    <button
      type="button"
      onClick={onCreateTab}
      className={TERMINAL_STYLES.createButton}
    >
      Create Terminal
    </button>
  </div>
);

type TerminalPaneProps = {
  tab: TerminalTab;
  isVisible: boolean;
  workingDir: string;
  createSession: (params: {
    tabId: string;
    workingDir: string;
    size: TerminalSize;
  }) => Promise<string | undefined>;
  writeToSession: (params: { sessionId: string; data: string }) => Promise<void>;
  resizeSession: (params: {
    sessionId: string;
    size: TerminalSize;
  }) => Promise<void>;
};

const TerminalPane = ({
  tab,
  isVisible,
  workingDir,
  createSession,
  writeToSession,
  resizeSession,
}: TerminalPaneProps) => {
  const handleSessionCreate = useCallback(
    async ({ size }: { size: TerminalSize }) =>
      await createSession({
        tabId: tab.id,
        workingDir,
        size,
      }),
    [tab.id, createSession, workingDir]
  );

  const handleInput = useCallback(
    ({ data }: { data: string }) => {
      if (tab.sessionId === undefined) {
        return;
      }
      void writeToSession({ sessionId: tab.sessionId, data });
    },
    [tab.sessionId, writeToSession]
  );

  const handleResize = useCallback(
    ({ size }: { size: TerminalSize }) => {
      if (tab.sessionId === undefined) {
        return;
      }
      void resizeSession({ sessionId: tab.sessionId, size });
    },
    [tab.sessionId, resizeSession]
  );

  return (
    <div className={`absolute inset-0 ${isVisible ? "block" : "hidden"}`}>
      <Terminal
        sessionId={tab.sessionId}
        onSessionCreate={handleSessionCreate}
        onInput={handleInput}
        onResize={handleResize}
      />
    </div>
  );
};

type TerminalTabsProps = {
  workingDir: string;
};

export const TerminalTabs = ({ workingDir }: TerminalTabsProps) => {
  const {
    tabs,
    tabCount,
    createTab,
    closeTab,
    switchTab,
    createSession,
    writeToSession,
    resizeSession,
  } = useTerminal();

  const canAddTab = tabCount < TERMINAL_TAB_LIMIT;

  const handleNewTab = useCallback(() => {
    createTab();
  }, [createTab]);

  if (tabs.length === 0) {
    return <EmptyState onCreateTab={handleNewTab} />;
  }

  return (
    <div className="flex h-full flex-col">
      <TabBar
        tabs={tabs}
        onSelectTab={switchTab}
        onCloseTab={closeTab}
        onNewTab={handleNewTab}
        canAddTab={canAddTab}
      />
      <div className="relative flex-1">
        {tabs.map((tab) => (
          <TerminalPane
            key={tab.id}
            tab={tab}
            isVisible={tab.isActive}
            workingDir={workingDir}
            createSession={createSession}
            writeToSession={writeToSession}
            resizeSession={resizeSession}
          />
        ))}
      </div>
    </div>
  );
};

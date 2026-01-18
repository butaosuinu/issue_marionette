import type {
  TerminalState,
  TerminalSessionStatus,
  TerminalSize,
} from "../types/terminal";

export const TERMINAL_SESSION_STATUS = Object.freeze({
  CONNECTING: "connecting" as const satisfies TerminalSessionStatus,
  CONNECTED: "connected" as const satisfies TerminalSessionStatus,
  DISCONNECTED: "disconnected" as const satisfies TerminalSessionStatus,
  ERROR: "error" as const satisfies TerminalSessionStatus,
});

export const DEFAULT_TERMINAL_SIZE: Readonly<TerminalSize> = Object.freeze({
  cols: 80,
  rows: 24,
});

export const DEFAULT_TERMINAL_STATE: TerminalState = Object.freeze({
  tabs: [],
  activeTabId: undefined,
  sessions: {},
});

export const TERMINAL_TAB_LIMIT = 10;

export const TAB_ID_PREFIX = "terminal-tab-";

export const XTERM_OPTIONS = Object.freeze({
  cursorBlink: true,
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
  theme: {
    background: "#1e1e2e",
    foreground: "#cdd6f4",
    cursor: "#f5e0dc",
    selectionBackground: "#585b70",
  },
  allowProposedApi: true,
});

export const TERMINAL_STYLES = Object.freeze({
  container: "h-full w-full bg-[#1e1e2e]",
  tabBar: "flex border-b border-gray-700 bg-gray-900",
  tabActive: "bg-gray-800 text-white",
  tabInactive: "bg-gray-900 text-gray-400 hover:bg-gray-800",
  tabButton: "flex items-center gap-2 px-3 py-2 text-sm",
  closeButton: "ml-1 rounded p-0.5 hover:bg-gray-700",
  newTabButton:
    "px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50",
  emptyState: "flex h-full items-center justify-center bg-gray-900",
  createButton: "rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700",
});

export const TAB_LABEL_PREFIX = "Terminal ";

export const ARRAY_INDEX = Object.freeze({
  NOT_FOUND: -1,
  FIRST: 0,
});

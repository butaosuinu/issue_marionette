import type { DiffState, DiffViewMode, FileChangeStatus } from "../types/diff";

export const DIFF_VIEW_MODE = Object.freeze({
  SIDE_BY_SIDE: "sideBySide" as const satisfies DiffViewMode,
  INLINE: "inline" as const satisfies DiffViewMode,
});

export const FILE_CHANGE_STATUS = Object.freeze({
  ADDED: "added" as const satisfies FileChangeStatus,
  MODIFIED: "modified" as const satisfies FileChangeStatus,
  DELETED: "deleted" as const satisfies FileChangeStatus,
  RENAMED: "renamed" as const satisfies FileChangeStatus,
});

export const STATUS_COLORS: Readonly<Record<FileChangeStatus, string>> =
  Object.freeze({
    added: "#22C55E",
    modified: "#F59E0B",
    deleted: "#EF4444",
    renamed: "#8B5CF6",
  });

export const STATUS_LABELS: Readonly<Record<FileChangeStatus, string>> =
  Object.freeze({
    added: "A",
    modified: "M",
    deleted: "D",
    renamed: "R",
  });

export const MONACO_DIFF_OPTIONS = Object.freeze({
  readOnly: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  fontSize: 13,
  lineHeight: 20,
});

export const DEFAULT_DIFF_STATE: DiffState = Object.freeze({
  files: [],
  selectedFilePath: undefined,
  viewMode: DIFF_VIEW_MODE.SIDE_BY_SIDE,
});

export const FILE_TREE_INDENT = Object.freeze({
  PER_DEPTH: 16,
  BASE_PADDING: 8,
});

export const SORT_ORDER = Object.freeze({
  BEFORE: -1,
  AFTER: 1,
});

export const SLICE_INDEX = Object.freeze({
  EXCLUDE_LAST: -1,
});

export const ARRAY_POSITION = Object.freeze({
  LAST: -1,
});

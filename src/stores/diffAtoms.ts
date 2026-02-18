import { atom } from "jotai";
import type {
  DiffState,
  DiffViewMode,
  FileDiff,
  DiffResponse,
} from "../types/diff";
import { DEFAULT_DIFF_STATE } from "../constants/diff";
import { invokeWithResult } from "../utils/invoke";
import { buildFileTree } from "../utils/diffParser";

export const worktreePathAtom = atom<string | undefined>(undefined);

const diffRefreshAtom = atom(0);

export const diffSuspenseAtom = atom(async (get) => {
  get(diffRefreshAtom);
  const worktreePath = get(worktreePathAtom);
  if (worktreePath === undefined) {
    return { files: [] as FileDiff[] };
  }

  const result = await invokeWithResult<DiffResponse>("get_worktree_diff", {
    worktreePath,
  });

  if (!result.ok) {
    throw new Error(result.error);
  }

  return result.data;
});

export const refreshDiffAtom = atom(null, (_get, set) => {
  set(diffRefreshAtom, (prev) => prev + 1);
});

export const diffStateAtom = atom<DiffState>(DEFAULT_DIFF_STATE);

export const diffFilesAtom = atom(async (get) => {
  const suspenseData = await get(diffSuspenseAtom);
  return suspenseData.files;
});

export const selectedFilePathAtom = atom<string | undefined>(
  (get) => get(diffStateAtom).selectedFilePath
);

export const viewModeAtom = atom<DiffViewMode>(
  (get) => get(diffStateAtom).viewMode
);

export const fileTreeAtom = atom(async (get) => {
  const files = await get(diffFilesAtom);
  return buildFileTree({ files });
});

export const selectedFileDiffAtom = atom(async (get) => {
  const files = await get(diffFilesAtom);
  const selectedPath = get(selectedFilePathAtom);
  if (selectedPath === undefined) {
    return undefined;
  }
  return files.find((f) => f.path === selectedPath);
});

export const diffStatsAtom = atom(async (get) => {
  const files = await get(diffFilesAtom);
  return files.reduce(
    (acc, file) => ({
      additions: acc.additions + file.additions,
      deletions: acc.deletions + file.deletions,
    }),
    { additions: 0, deletions: 0 }
  );
});

export const setViewModeAtom = atom(null, (get, set, mode: DiffViewMode) => {
  set(diffStateAtom, { ...get(diffStateAtom), viewMode: mode });
});

export const selectFileAtom = atom(
  null,
  (get, set, filePath: string | undefined) => {
    set(diffStateAtom, { ...get(diffStateAtom), selectedFilePath: filePath });
  }
);

export const setDiffFilesAtom = atom(null, (get, set, files: FileDiff[]) => {
  const firstFilePath = files.length > 0 ? files[0].path : undefined;
  set(diffStateAtom, {
    ...get(diffStateAtom),
    files,
    selectedFilePath: firstFilePath,
  });
});

export const clearDiffAtom = atom(null, (_get, set) => {
  set(diffStateAtom, DEFAULT_DIFF_STATE);
  set(worktreePathAtom, undefined);
});

export const setWorktreePathAtom = atom(
  null,
  (_get, set, worktreePath: string | undefined) => {
    set(worktreePathAtom, worktreePath);
    if (worktreePath === undefined) {
      set(diffStateAtom, DEFAULT_DIFF_STATE);
    }
  }
);

export const initializeSelectedFileAtom = atom(
  null,
  async (get, set) => {
    const files = await get(diffFilesAtom);
    const currentSelected = get(selectedFilePathAtom);
    if (currentSelected === undefined && files.length > 0) {
      set(diffStateAtom, {
        ...get(diffStateAtom),
        selectedFilePath: files[0].path,
      });
    }
  }
);

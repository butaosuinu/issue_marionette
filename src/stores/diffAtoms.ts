import { atom } from "jotai";
import type {
  DiffState,
  DiffViewMode,
  FileDiff,
  FileTreeNode,
  DiffResponse,
} from "../types/diff";
import { DEFAULT_DIFF_STATE } from "../constants/diff";
import { invokeWithResult } from "../utils/invoke";
import { buildFileTree } from "../utils/diffParser";

export const diffStateAtom = atom<DiffState>(DEFAULT_DIFF_STATE);

export const isLoadingDiffAtom = atom<boolean>(
  (get) => get(diffStateAtom).isLoading
);

export const diffErrorAtom = atom<string | undefined>(
  (get) => get(diffStateAtom).error
);

export const diffFilesAtom = atom<FileDiff[]>((get) => get(diffStateAtom).files);

export const selectedFilePathAtom = atom<string | undefined>(
  (get) => get(diffStateAtom).selectedFilePath
);

export const viewModeAtom = atom<DiffViewMode>(
  (get) => get(diffStateAtom).viewMode
);

export const fileTreeAtom = atom<FileTreeNode[]>((get) => {
  const files = get(diffFilesAtom);
  return buildFileTree({ files });
});

export const selectedFileDiffAtom = atom<FileDiff | undefined>((get) => {
  const files = get(diffFilesAtom);
  const selectedPath = get(selectedFilePathAtom);
  if (selectedPath === undefined) {
    return undefined;
  }
  return files.find((f) => f.path === selectedPath);
});

export const diffStatsAtom = atom<{ additions: number; deletions: number }>(
  (get) => {
    const files = get(diffFilesAtom);
    return files.reduce(
      (acc, file) => ({
        additions: acc.additions + file.additions,
        deletions: acc.deletions + file.deletions,
      }),
      { additions: 0, deletions: 0 }
    );
  }
);

export const setViewModeAtom = atom(null, (get, set, mode: DiffViewMode) => {
  set(diffStateAtom, { ...get(diffStateAtom), viewMode: mode });
});

export const selectFileAtom = atom(
  null,
  (get, set, filePath: string | undefined) => {
    set(diffStateAtom, { ...get(diffStateAtom), selectedFilePath: filePath });
  }
);

export const loadDiffAtom = atom(null, async (get, set, worktreePath: string) => {
  set(diffStateAtom, {
    ...get(diffStateAtom),
    isLoading: true,
    error: undefined,
  });

  const result = await invokeWithResult<DiffResponse>("get_worktree_diff", {
    worktreePath,
  });

  if (!result.ok) {
    set(diffStateAtom, {
      ...get(diffStateAtom),
      isLoading: false,
      error: result.error,
    });
    return;
  }

  const { files } = result.data;
  const firstFilePath = files.length > 0 ? files[0].path : undefined;

  set(diffStateAtom, {
    ...get(diffStateAtom),
    isLoading: false,
    error: undefined,
    files,
    selectedFilePath: firstFilePath,
  });
});

export const setDiffFilesAtom = atom(null, (get, set, files: FileDiff[]) => {
  const firstFilePath = files.length > 0 ? files[0].path : undefined;
  set(diffStateAtom, {
    ...get(diffStateAtom),
    files,
    selectedFilePath: firstFilePath,
    isLoading: false,
    error: undefined,
  });
});

export const clearDiffAtom = atom(null, (_get, set) => {
  set(diffStateAtom, DEFAULT_DIFF_STATE);
});

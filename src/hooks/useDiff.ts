import { useCallback } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  isLoadingDiffAtom,
  diffErrorAtom,
  diffFilesAtom,
  selectedFilePathAtom,
  selectedFileDiffAtom,
  viewModeAtom,
  fileTreeAtom,
  diffStatsAtom,
  loadDiffAtom,
  selectFileAtom,
  setViewModeAtom,
  setDiffFilesAtom,
  clearDiffAtom,
} from "../stores/diffAtoms";
import type {
  DiffViewMode,
  FileDiff,
  FileTreeNode,
} from "../types/diff";

type UseDiffReturn = {
  isLoading: boolean;
  error: string | undefined;
  files: FileDiff[];
  selectedFilePath: string | undefined;
  selectedFileDiff: FileDiff | undefined;
  viewMode: DiffViewMode;
  fileTree: FileTreeNode[];
  stats: { additions: number; deletions: number };
  loadDiff: (params: { worktreePath: string }) => Promise<void>;
  selectFile: (params: { filePath: string | undefined }) => void;
  setViewMode: (params: { mode: DiffViewMode }) => void;
  setFiles: (params: { files: FileDiff[] }) => void;
  clearDiff: () => void;
};

export const useDiff = (): UseDiffReturn => {
  const isLoading = useAtomValue(isLoadingDiffAtom);
  const error = useAtomValue(diffErrorAtom);
  const files = useAtomValue(diffFilesAtom);
  const selectedFilePath = useAtomValue(selectedFilePathAtom);
  const selectedFileDiff = useAtomValue(selectedFileDiffAtom);
  const viewMode = useAtomValue(viewModeAtom);
  const fileTree = useAtomValue(fileTreeAtom);
  const stats = useAtomValue(diffStatsAtom);

  const doLoadDiff = useSetAtom(loadDiffAtom);
  const doSelectFile = useSetAtom(selectFileAtom);
  const doSetViewMode = useSetAtom(setViewModeAtom);
  const doSetFiles = useSetAtom(setDiffFilesAtom);
  const doClearDiff = useSetAtom(clearDiffAtom);

  const loadDiff = useCallback(
    async ({ worktreePath }: { worktreePath: string }) => {
      await doLoadDiff(worktreePath);
    },
    [doLoadDiff]
  );

  const selectFile = useCallback(
    ({ filePath }: { filePath: string | undefined }) => {
      doSelectFile(filePath);
    },
    [doSelectFile]
  );

  const setViewMode = useCallback(
    ({ mode }: { mode: DiffViewMode }) => {
      doSetViewMode(mode);
    },
    [doSetViewMode]
  );

  const setFiles = useCallback(
    ({ files }: { files: FileDiff[] }) => {
      doSetFiles(files);
    },
    [doSetFiles]
  );

  const clearDiff = useCallback(() => {
    doClearDiff();
  }, [doClearDiff]);

  return {
    isLoading,
    error,
    files,
    selectedFilePath,
    selectedFileDiff,
    viewMode,
    fileTree,
    stats,
    loadDiff,
    selectFile,
    setViewMode,
    setFiles,
    clearDiff,
  };
};

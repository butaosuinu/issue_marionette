import { useCallback, useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  diffFilesAtom,
  selectedFilePathAtom,
  selectedFileDiffAtom,
  viewModeAtom,
  fileTreeAtom,
  diffStatsAtom,
  selectFileAtom,
  setViewModeAtom,
  setDiffFilesAtom,
  clearDiffAtom,
  setWorktreePathAtom,
  initializeSelectedFileAtom,
} from "../stores/diffAtoms";
import type { DiffViewMode, FileDiff, FileTreeNode } from "../types/diff";

type UseDiffReturn = {
  files: FileDiff[];
  selectedFilePath: string | undefined;
  selectedFileDiff: FileDiff | undefined;
  viewMode: DiffViewMode;
  fileTree: FileTreeNode[];
  stats: { additions: number; deletions: number };
  selectFile: (params: { filePath: string | undefined }) => void;
  setViewMode: (params: { mode: DiffViewMode }) => void;
  setFiles: (params: { files: FileDiff[] }) => void;
  clearDiff: () => void;
  setWorktreePath: (params: { worktreePath: string | undefined }) => void;
};

export const useDiff = (): UseDiffReturn => {
  const files = useAtomValue(diffFilesAtom);
  const selectedFilePath = useAtomValue(selectedFilePathAtom);
  const selectedFileDiff = useAtomValue(selectedFileDiffAtom);
  const viewMode = useAtomValue(viewModeAtom);
  const fileTree = useAtomValue(fileTreeAtom);
  const stats = useAtomValue(diffStatsAtom);

  const doSelectFile = useSetAtom(selectFileAtom);
  const doSetViewMode = useSetAtom(setViewModeAtom);
  const doSetFiles = useSetAtom(setDiffFilesAtom);
  const doClearDiff = useSetAtom(clearDiffAtom);
  const doSetWorktreePath = useSetAtom(setWorktreePathAtom);
  const doInitializeSelectedFile = useSetAtom(initializeSelectedFileAtom);

  useEffect(() => {
    doInitializeSelectedFile();
  }, [files, doInitializeSelectedFile]);

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

  const setWorktreePath = useCallback(
    ({ worktreePath }: { worktreePath: string | undefined }) => {
      doSetWorktreePath(worktreePath);
    },
    [doSetWorktreePath]
  );

  return {
    files,
    selectedFilePath,
    selectedFileDiff,
    viewMode,
    fileTree,
    stats,
    selectFile,
    setViewMode,
    setFiles,
    clearDiff,
    setWorktreePath,
  };
};

import { useCallback } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { invokeWithResult } from "../utils/invoke";
import {
  worktreesAtom,
  activeWorktreeAtom,
  activeWorktreeIdAtom,
  isWorktreeLoadingAtom,
  worktreeByIssueNumberAtom,
  setWorktreesAtom,
  setActiveWorktreeAtom,
  addWorktreeAtom,
  removeWorktreeAtom,
  setWorktreeLoadingAtom,
} from "../stores/worktreeAtoms";
import type { Worktree } from "../types/worktree";

type CreateWorktreeParams = {
  repoPath: string;
  issueNumber: number;
  branchName: string;
};

type UseWorktreeReturn = {
  worktrees: Worktree[];
  activeWorktree: Worktree | undefined;
  activeWorktreeId: string | undefined;
  isLoading: boolean;
  getWorktreeByIssueNumber: (issueNumber: number) => Worktree | undefined;
  createWorktree: (params: CreateWorktreeParams) => Promise<Worktree | undefined>;
  listWorktrees: (params: { repoPath: string }) => Promise<Worktree[]>;
  removeWorktree: (params: { worktreePath: string; force: boolean }) => Promise<void>;
  getDiff: (params: { worktreePath: string }) => Promise<string | undefined>;
  setActiveWorktree: (worktreeId: string | undefined) => void;
};

export const useWorktree = (): UseWorktreeReturn => {
  const worktrees = useAtomValue(worktreesAtom);
  const activeWorktree = useAtomValue(activeWorktreeAtom);
  const activeWorktreeId = useAtomValue(activeWorktreeIdAtom);
  const isLoading = useAtomValue(isWorktreeLoadingAtom);
  const worktreeByIssueNumber = useAtomValue(worktreeByIssueNumberAtom);

  const doSetWorktrees = useSetAtom(setWorktreesAtom);
  const doSetActiveWorktree = useSetAtom(setActiveWorktreeAtom);
  const doAddWorktree = useSetAtom(addWorktreeAtom);
  const doRemoveWorktree = useSetAtom(removeWorktreeAtom);
  const doSetLoading = useSetAtom(setWorktreeLoadingAtom);

  const getWorktreeByIssueNumber = useCallback(
    (issueNumber: number): Worktree | undefined =>
      worktreeByIssueNumber(issueNumber),
    [worktreeByIssueNumber]
  );

  const createWorktree = useCallback(
    async ({
      repoPath,
      issueNumber,
      branchName,
    }: CreateWorktreeParams): Promise<Worktree | undefined> => {
      doSetLoading(true);
      const result = await invokeWithResult<Worktree>("create_worktree", {
        repo_path: repoPath,
        issue_number: issueNumber,
        branch_name: branchName,
      });
      doSetLoading(false);

      if (!result.ok) {
        return undefined;
      }

      doAddWorktree(result.data);
      doSetActiveWorktree(result.data.id);
      return result.data;
    },
    [doAddWorktree, doSetActiveWorktree, doSetLoading]
  );

  const listWorktrees = useCallback(
    async ({ repoPath }: { repoPath: string }): Promise<Worktree[]> => {
      doSetLoading(true);
      const result = await invokeWithResult<Worktree[]>("list_worktrees", {
        repo_path: repoPath,
      });
      doSetLoading(false);

      if (!result.ok) {
        return [];
      }

      doSetWorktrees(result.data);
      return result.data;
    },
    [doSetWorktrees, doSetLoading]
  );

  const removeWorktree = useCallback(
    async ({
      worktreePath,
      force,
    }: {
      worktreePath: string;
      force: boolean;
    }): Promise<void> => {
      const result = await invokeWithResult<undefined>("remove_worktree", {
        worktree_path: worktreePath,
        force,
      });

      if (result.ok) {
        const worktreeToRemove = worktrees.find((w) => w.path === worktreePath);
        if (worktreeToRemove !== undefined) {
          doRemoveWorktree(worktreeToRemove.id);
        }
      }
    },
    [worktrees, doRemoveWorktree]
  );

  const getDiff = useCallback(
    async ({
      worktreePath,
    }: {
      worktreePath: string;
    }): Promise<string | undefined> => {
      const result = await invokeWithResult<string>("get_worktree_diff", {
        worktree_path: worktreePath,
      });

      if (!result.ok) {
        return undefined;
      }

      return result.data;
    },
    []
  );

  const setActiveWorktree = useCallback(
    (worktreeId: string | undefined) => {
      doSetActiveWorktree(worktreeId);
    },
    [doSetActiveWorktree]
  );

  return {
    worktrees,
    activeWorktree,
    activeWorktreeId,
    isLoading,
    getWorktreeByIssueNumber,
    createWorktree,
    listWorktrees,
    removeWorktree,
    getDiff,
    setActiveWorktree,
  };
};

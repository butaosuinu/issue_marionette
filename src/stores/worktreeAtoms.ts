import { atom } from "jotai";
import type { Worktree } from "../types/worktree";

export type WorktreeState = {
  worktrees: Record<string, Worktree>;
  activeWorktreeId: string | undefined;
  isLoading: boolean;
};

const DEFAULT_WORKTREE_STATE: WorktreeState = {
  worktrees: {},
  activeWorktreeId: undefined,
  isLoading: false,
};

export const worktreeStateAtom = atom<WorktreeState>(DEFAULT_WORKTREE_STATE);

export const worktreesAtom = atom<Worktree[]>((get) =>
  Object.values(get(worktreeStateAtom).worktrees)
);

export const activeWorktreeIdAtom = atom<string | undefined>(
  (get) => get(worktreeStateAtom).activeWorktreeId
);

export const activeWorktreeAtom = atom<Worktree | undefined>((get) => {
  const state = get(worktreeStateAtom);
  if (state.activeWorktreeId === undefined) {
    return undefined;
  }
  return state.worktrees[state.activeWorktreeId];
});

export const isWorktreeLoadingAtom = atom<boolean>(
  (get) => get(worktreeStateAtom).isLoading
);

export const worktreeByIssueNumberAtom = atom(
  (get) => (issueNumber: number) => {
    const worktrees = get(worktreesAtom);
    return worktrees.find(
      (worktree) => worktree.issue_number === issueNumber
    );
  }
);

export const setWorktreesAtom = atom(
  null,
  (get, set, worktrees: Worktree[]) => {
    const state = get(worktreeStateAtom);
    const worktreesMap = worktrees.reduce<Record<string, Worktree>>(
      (acc, worktree) => ({
        ...acc,
        [worktree.id]: worktree,
      }),
      {}
    );
    set(worktreeStateAtom, {
      ...state,
      worktrees: worktreesMap,
    });
  }
);

export const setActiveWorktreeAtom = atom(
  null,
  (get, set, worktreeId: string | undefined) => {
    const state = get(worktreeStateAtom);
    set(worktreeStateAtom, {
      ...state,
      activeWorktreeId: worktreeId,
    });
  }
);

export const addWorktreeAtom = atom(null, (get, set, worktree: Worktree) => {
  const state = get(worktreeStateAtom);
  set(worktreeStateAtom, {
    ...state,
    worktrees: {
      ...state.worktrees,
      [worktree.id]: worktree,
    },
  });
});

export const removeWorktreeAtom = atom(
  null,
  (get, set, worktreeId: string) => {
    const state = get(worktreeStateAtom);
    const { [worktreeId]: _, ...remainingWorktrees } = state.worktrees;
    const newActiveWorktreeId =
      state.activeWorktreeId === worktreeId
        ? undefined
        : state.activeWorktreeId;
    set(worktreeStateAtom, {
      ...state,
      worktrees: remainingWorktrees,
      activeWorktreeId: newActiveWorktreeId,
    });
  }
);

export const setWorktreeLoadingAtom = atom(
  null,
  (get, set, isLoading: boolean) => {
    const state = get(worktreeStateAtom);
    set(worktreeStateAtom, {
      ...state,
      isLoading,
    });
  }
);

export const clearWorktreeStateAtom = atom(null, (_get, set) => {
  set(worktreeStateAtom, DEFAULT_WORKTREE_STATE);
});

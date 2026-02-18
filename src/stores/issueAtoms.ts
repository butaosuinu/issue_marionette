import { atom } from "jotai";
import type { Issue } from "../types/kanban";
import { ARRAY_INDEX } from "../constants/kanban";
import { issuesByColumnAtom } from "./kanbanAtoms";
import { arrayMove } from "../utils/array";

export const issuesMapAtom = atom<Partial<Record<string, Issue>>>({});

export const issuesAtom = atom((get) =>
  Object.values(get(issuesMapAtom)).filter(
    (issue): issue is Issue => issue !== undefined
  )
);

export const addIssueAtom = atom(null, (get, set, issue: Issue) => {
  const issuesMap = get(issuesMapAtom);
  set(issuesMapAtom, { ...issuesMap, [issue.id]: issue });

  const issuesByColumn = get(issuesByColumnAtom);
  const columnIssues = issuesByColumn[issue.columnId] ?? [];
  set(issuesByColumnAtom, {
    ...issuesByColumn,
    [issue.columnId]: [...columnIssues, issue.id],
  });
});

export const moveIssueAtom = atom(
  null,
  (
    get,
    set,
    {
      issueId,
      sourceColumnId,
      targetColumnId,
      targetIndex,
    }: {
      issueId: string;
      sourceColumnId: string;
      targetColumnId: string;
      targetIndex: number;
    }
  ) => {
    const issuesByColumn = get(issuesByColumnAtom);
    const issuesMap = get(issuesMapAtom);

    const sourceIssues = (issuesByColumn[sourceColumnId] ?? []).filter(
      (id) => id !== issueId
    );

    const baseTargetIssues = issuesByColumn[targetColumnId] ?? [];
    const filteredTargetIssues =
      sourceColumnId === targetColumnId
        ? baseTargetIssues.filter((id) => id !== issueId)
        : baseTargetIssues;
    const targetIssues = filteredTargetIssues.toSpliced(
      targetIndex,
      ARRAY_INDEX.FIRST,
      issueId,
    );

    set(issuesByColumnAtom, {
      ...issuesByColumn,
      [sourceColumnId]: sourceIssues,
      [targetColumnId]: targetIssues,
    });

    const { [issueId]: issue } = issuesMap;
    if (issue !== undefined) {
      set(issuesMapAtom, {
        ...issuesMap,
        [issueId]: { ...issue, columnId: targetColumnId },
      });
    }
  }
);

export const reorderIssueAtom = atom(
  null,
  (
    get,
    set,
    {
      columnId,
      activeId,
      overId,
    }: {
      columnId: string;
      activeId: string;
      overId: string;
    }
  ) => {
    const issuesByColumn = get(issuesByColumnAtom);
    const columnIssues = issuesByColumn[columnId] ?? [];

    const activeIndex = columnIssues.indexOf(activeId);
    const overIndex = columnIssues.indexOf(overId);

    if (
      activeIndex === ARRAY_INDEX.NOT_FOUND ||
      overIndex === ARRAY_INDEX.NOT_FOUND
    ) {
      return;
    }

    const reordered = arrayMove(columnIssues, activeIndex, overIndex);
    set(issuesByColumnAtom, {
      ...issuesByColumn,
      [columnId]: reordered,
    });
  }
);

export const initializeIssuesAtom = atom(
  null,
  (get, set, issues: readonly Issue[]) => {
    const issuesMap = issues.reduce<Record<string, Issue>>(
      (acc, issue) => ({ ...acc, [issue.id]: issue }),
      {}
    );
    set(issuesMapAtom, issuesMap);

    const issuesByColumn = issues.reduce<Record<string, string[]>>(
      (acc, issue) => ({
        ...acc,
        [issue.columnId]: [...(acc[issue.columnId] ?? []), issue.id],
      }),
      {}
    );

    const currentIssuesByColumn = get(issuesByColumnAtom);
    set(issuesByColumnAtom, {
      ...currentIssuesByColumn,
      ...issuesByColumn,
    });
  }
);

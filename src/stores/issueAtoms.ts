import { atom } from "jotai";
import { invoke } from "@tauri-apps/api/core";
import type { Issue } from "../types/kanban";
import type { GitHubIssue } from "../types/github";
import { ARRAY_INDEX } from "../constants/kanban";
import { issuesByColumnAtom } from "./kanbanAtoms";
import { selectedRepositoryAtom } from "./repositoryAtoms";
import { arrayMove } from "../utils/array";

const COLUMN_ID_BY_STATE = Object.freeze({
  open: "backlog",
  closed: "done",
} as const);

const DEFAULT_PRIORITY = "medium" as const;

const COLOR_PREFIX = "#";

const transformGitHubIssue = (issue: GitHubIssue): Issue => ({
  id: String(issue.id),
  number: issue.number,
  title: issue.title,
  body: issue.body ?? "",
  state: issue.state,
  priority: DEFAULT_PRIORITY,
  labels: issue.labels.map((label) => ({
    id: String(label.id),
    name: label.name,
    color: `${COLOR_PREFIX}${label.color}`,
  })),
  assignee: issue.assignees[0]?.login,
  createdAt: issue.created_at,
  updatedAt: issue.updated_at,
  columnId: COLUMN_ID_BY_STATE[issue.state],
});

const githubIssuesRefreshAtom = atom(0);

export const githubIssuesSuspenseAtom = atom(async (get) => {
  get(githubIssuesRefreshAtom);
  const repo = await get(selectedRepositoryAtom);
  if (repo === undefined) {
    return [] as Issue[];
  }
  const issues = await invoke<GitHubIssue[]>("list_issues", {
    owner: repo.owner,
    repo: repo.name,
    excludePullRequests: true,
  }).catch((err: unknown) => {
    throw err instanceof Error
      ? err
      : new Error("Issueの読み込みに失敗しました");
  });
  return issues.map((issue) => transformGitHubIssue(issue));
});

export const refreshGithubIssuesAtom = atom(null, (_get, set) => {
  set(githubIssuesRefreshAtom, (prev) => prev + 1);
});

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

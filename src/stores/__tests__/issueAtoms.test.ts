import { createStore } from "jotai";
import { describe, it, expect } from "vitest";
import {
  issuesMapAtom,
  issuesAtom,
  addIssueAtom,
  moveIssueAtom,
  reorderIssueAtom,
  initializeIssuesAtom,
} from "../issueAtoms";
import { issuesByColumnAtom } from "../kanbanAtoms";
import type { Issue } from "../../types";

const createMockIssue = (overrides: Partial<Issue> = {}): Issue => ({
  id: "issue-1",
  number: 1,
  title: "Test Issue",
  body: "Test body",
  state: "open",
  priority: "medium",
  labels: [],
  assignee: undefined,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  columnId: "todo",
  ...overrides,
});

describe("issueAtoms", () => {
  const createTestStore = () => createStore();

  describe("addIssueAtom", () => {
    it("Issueを追加できる", () => {
      const store = createTestStore();
      const issue = createMockIssue();

      store.set(addIssueAtom, issue);

      const issuesMap = store.get(issuesMapAtom);
      expect(issuesMap["issue-1"]).toEqual(issue);
    });

    it("issuesByColumnにIssue IDが追加される", () => {
      const store = createTestStore();
      const issue = createMockIssue({ columnId: "todo" });

      store.set(addIssueAtom, issue);

      const issuesByColumn = store.get(issuesByColumnAtom);
      expect(issuesByColumn["todo"]).toContain("issue-1");
    });
  });

  describe("issuesAtom", () => {
    it("全Issueの配列を返す", () => {
      const store = createTestStore();
      const issue1 = createMockIssue({ id: "issue-1" });
      const issue2 = createMockIssue({ id: "issue-2" });

      store.set(addIssueAtom, issue1);
      store.set(addIssueAtom, issue2);

      const issues = store.get(issuesAtom);
      expect(issues.length).toBe(2);
    });
  });

  describe("moveIssueAtom", () => {
    it("Issueを別のカラムに移動できる", () => {
      const store = createTestStore();
      const issue = createMockIssue({ id: "issue-1", columnId: "todo" });

      store.set(addIssueAtom, issue);
      store.set(moveIssueAtom, {
        issueId: "issue-1",
        sourceColumnId: "todo",
        targetColumnId: "in-progress",
        targetIndex: 0,
      });

      const issuesByColumn = store.get(issuesByColumnAtom);
      expect(issuesByColumn["todo"]).not.toContain("issue-1");
      expect(issuesByColumn["in-progress"]).toContain("issue-1");
    });

    it("IssueのcolumnIdが更新される", () => {
      const store = createTestStore();
      const issue = createMockIssue({ id: "issue-1", columnId: "todo" });

      store.set(addIssueAtom, issue);
      store.set(moveIssueAtom, {
        issueId: "issue-1",
        sourceColumnId: "todo",
        targetColumnId: "in-progress",
        targetIndex: 0,
      });

      const issuesMap = store.get(issuesMapAtom);
      expect(issuesMap["issue-1"].columnId).toBe("in-progress");
    });

    it("指定したインデックスに挿入される", () => {
      const store = createTestStore();
      const issue1 = createMockIssue({ id: "issue-1", columnId: "in-progress" });
      const issue2 = createMockIssue({ id: "issue-2", columnId: "in-progress" });
      const issue3 = createMockIssue({ id: "issue-3", columnId: "todo" });

      store.set(addIssueAtom, issue1);
      store.set(addIssueAtom, issue2);
      store.set(addIssueAtom, issue3);

      store.set(moveIssueAtom, {
        issueId: "issue-3",
        sourceColumnId: "todo",
        targetColumnId: "in-progress",
        targetIndex: 1,
      });

      const issuesByColumn = store.get(issuesByColumnAtom);
      expect(issuesByColumn["in-progress"]).toEqual([
        "issue-1",
        "issue-3",
        "issue-2",
      ]);
    });
  });

  describe("reorderIssueAtom", () => {
    it("同一カラム内でIssueの順序を変更できる", () => {
      const store = createTestStore();
      const issue1 = createMockIssue({ id: "issue-1", columnId: "todo" });
      const issue2 = createMockIssue({ id: "issue-2", columnId: "todo" });
      const issue3 = createMockIssue({ id: "issue-3", columnId: "todo" });

      store.set(addIssueAtom, issue1);
      store.set(addIssueAtom, issue2);
      store.set(addIssueAtom, issue3);

      store.set(reorderIssueAtom, {
        columnId: "todo",
        activeId: "issue-1",
        overId: "issue-3",
      });

      const issuesByColumn = store.get(issuesByColumnAtom);
      expect(issuesByColumn["todo"]).toEqual(["issue-2", "issue-3", "issue-1"]);
    });

    it("存在しないIssue IDでは何も起きない", () => {
      const store = createTestStore();
      const issue1 = createMockIssue({ id: "issue-1", columnId: "todo" });

      store.set(addIssueAtom, issue1);

      store.set(reorderIssueAtom, {
        columnId: "todo",
        activeId: "non-existent",
        overId: "issue-1",
      });

      const issuesByColumn = store.get(issuesByColumnAtom);
      expect(issuesByColumn["todo"]).toEqual(["issue-1"]);
    });
  });

  describe("initializeIssuesAtom", () => {
    it("複数のIssueを一括で初期化できる", () => {
      const store = createTestStore();
      const issues = [
        createMockIssue({ id: "issue-1", columnId: "todo" }),
        createMockIssue({ id: "issue-2", columnId: "in-progress" }),
        createMockIssue({ id: "issue-3", columnId: "done" }),
      ];

      store.set(initializeIssuesAtom, issues);

      const issuesMap = store.get(issuesMapAtom);
      expect(Object.keys(issuesMap).length).toBe(3);

      const issuesByColumn = store.get(issuesByColumnAtom);
      expect(issuesByColumn["todo"]).toContain("issue-1");
      expect(issuesByColumn["in-progress"]).toContain("issue-2");
      expect(issuesByColumn["done"]).toContain("issue-3");
    });
  });
});

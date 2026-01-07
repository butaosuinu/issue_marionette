import { createStore } from "jotai";
import { describe, it, expect } from "vitest";
import {
  columnsAtom,
  sortedColumnsAtom,
  issuesByColumnAtom,
  addColumnAtom,
  removeColumnAtom,
  updateColumnAtom,
  reorderColumnsAtom,
} from "../kanbanAtoms";

describe("kanbanAtoms", () => {
  const createTestStore = () => createStore();

  describe("columnsAtom", () => {
    it("デフォルトカラムで初期化される", () => {
      const store = createTestStore();
      const columns = store.get(columnsAtom);

      expect(columns.length).toBe(5);
      expect(columns[0].title).toBe("Backlog");
      expect(columns[4].title).toBe("Done");
    });
  });

  describe("sortedColumnsAtom", () => {
    it("カラムがorder順でソートされる", () => {
      const store = createTestStore();
      const sortedColumns = store.get(sortedColumnsAtom);

      expect(sortedColumns[0].title).toBe("Backlog");
      expect(sortedColumns[1].title).toBe("Todo");
      expect(sortedColumns[2].title).toBe("In Progress");
      expect(sortedColumns[3].title).toBe("Review");
      expect(sortedColumns[4].title).toBe("Done");
    });
  });

  describe("addColumnAtom", () => {
    it("新しいカラムを追加できる", () => {
      const store = createTestStore();

      store.set(addColumnAtom, {
        id: "custom-1",
        title: "Custom Column",
        isDefault: false,
        color: "#FF0000",
      });

      const columns = store.get(columnsAtom);
      expect(columns.length).toBe(6);

      const newColumn = columns.find((c) => c.id === "custom-1");
      expect(newColumn).toBeDefined();
      expect(newColumn?.title).toBe("Custom Column");
      expect(newColumn?.order).toBe(5);
    });

    it("新しいカラムのissuesByColumnエントリが作成される", () => {
      const store = createTestStore();

      store.set(addColumnAtom, {
        id: "custom-1",
        title: "Custom Column",
        isDefault: false,
        color: "#FF0000",
      });

      const issuesByColumn = store.get(issuesByColumnAtom);
      expect(issuesByColumn["custom-1"]).toEqual([]);
    });
  });

  describe("removeColumnAtom", () => {
    it("カスタムカラムを削除できる", () => {
      const store = createTestStore();

      store.set(addColumnAtom, {
        id: "custom-1",
        title: "Custom Column",
        isDefault: false,
        color: "#FF0000",
      });

      store.set(removeColumnAtom, "custom-1");

      const columns = store.get(columnsAtom);
      expect(columns.length).toBe(5);
      expect(columns.find((c) => c.id === "custom-1")).toBeUndefined();
    });

    it("デフォルトカラムは削除できない", () => {
      const store = createTestStore();

      store.set(removeColumnAtom, "backlog");

      const columns = store.get(columnsAtom);
      expect(columns.length).toBe(5);
      expect(columns.find((c) => c.id === "backlog")).toBeDefined();
    });
  });

  describe("updateColumnAtom", () => {
    it("カラムのタイトルを更新できる", () => {
      const store = createTestStore();

      store.set(updateColumnAtom, {
        columnId: "backlog",
        updates: { title: "バックログ" },
      });

      const columns = store.get(columnsAtom);
      const backlog = columns.find((c) => c.id === "backlog");
      expect(backlog?.title).toBe("バックログ");
    });

    it("カラムの色を更新できる", () => {
      const store = createTestStore();

      store.set(updateColumnAtom, {
        columnId: "todo",
        updates: { color: "#FF0000" },
      });

      const columns = store.get(columnsAtom);
      const todo = columns.find((c) => c.id === "todo");
      expect(todo?.color).toBe("#FF0000");
    });
  });

  describe("reorderColumnsAtom", () => {
    it("カラムの順序を変更できる", () => {
      const store = createTestStore();

      store.set(reorderColumnsAtom, {
        activeId: "backlog",
        overId: "done",
      });

      const sortedColumns = store.get(sortedColumnsAtom);
      expect(sortedColumns[sortedColumns.length - 1].id).toBe("backlog");
    });

    it("存在しないカラムIDでは何も起きない", () => {
      const store = createTestStore();
      const beforeColumns = store.get(columnsAtom);

      store.set(reorderColumnsAtom, {
        activeId: "non-existent",
        overId: "done",
      });

      const afterColumns = store.get(columnsAtom);
      expect(afterColumns).toEqual(beforeColumns);
    });
  });
});

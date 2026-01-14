import { atom } from "jotai";
import type { KanbanColumn } from "../types";
import { DEFAULT_COLUMNS, ARRAY_INDEX } from "../constants/kanban";
import { arrayMove } from "../utils/array";

export const columnsAtom = atom<KanbanColumn[]>([...DEFAULT_COLUMNS]);

export const sortedColumnsAtom = atom<KanbanColumn[]>((get) => {
  const columns = get(columnsAtom);
  return [...columns].toSorted((a, b) => a.order - b.order);
});

export const issuesByColumnAtom = atom<Record<string, string[]>>({
  backlog: [],
  todo: [],
  "in-progress": [],
  review: [],
  done: [],
});

export const addColumnAtom = atom(
  null,
  (get, set, column: Omit<KanbanColumn, "order">) => {
    const columns = get(columnsAtom);
    const maxOrder = columns.reduce<number>(
      (max, col) => Math.max(max, col.order),
      ARRAY_INDEX.NOT_FOUND
    );
    const newColumn: KanbanColumn = {
      ...column,
      order: maxOrder + ARRAY_INDEX.INCREMENT,
    };
    set(columnsAtom, [...columns, newColumn]);
    set(issuesByColumnAtom, { ...get(issuesByColumnAtom), [column.id]: [] });
  }
);

export const removeColumnAtom = atom(null, (get, set, columnId: string) => {
  const columns = get(columnsAtom);
  const column = columns.find((c) => c.id === columnId);
  if (column?.isDefault === true) {
    return;
  }
  set(
    columnsAtom,
    columns.filter((c) => c.id !== columnId)
  );
  const issuesByColumn = get(issuesByColumnAtom);
  const { [columnId]: _removedColumn, ...rest } = issuesByColumn;
  set(issuesByColumnAtom, rest);
});

export const updateColumnAtom = atom(
  null,
  (
    get,
    set,
    { columnId, updates }: { columnId: string; updates: Partial<KanbanColumn> }
  ) => {
    const columns = get(columnsAtom);
    set(
      columnsAtom,
      columns.map((col) => (col.id === columnId ? { ...col, ...updates } : col))
    );
  }
);

export const reorderColumnsAtom = atom(
  null,
  (get, set, { activeId, overId }: { activeId: string; overId: string }) => {
    const columns = get(columnsAtom);
    const activeIndex = columns.findIndex((c) => c.id === activeId);
    const overIndex = columns.findIndex((c) => c.id === overId);
    if (
      activeIndex === ARRAY_INDEX.NOT_FOUND ||
      overIndex === ARRAY_INDEX.NOT_FOUND
    ) {
      return;
    }
    const reordered = arrayMove(columns, activeIndex, overIndex);
    const withUpdatedOrder = reordered.map((col, index) => ({
      ...col,
      order: index,
    }));
    set(columnsAtom, withUpdatedOrder);
  }
);

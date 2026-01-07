import {
  DndContext,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import {
  sortedColumnsAtom,
  issuesByColumnAtom,
  issuesMapAtom,
  moveIssueAtom,
  reorderIssueAtom,
  reorderColumnsAtom,
  initializeIssuesAtom,
} from "../../stores";
import { KanbanColumn } from "./KanbanColumn";
import { ColumnSettings } from "./ColumnSettings";
import { IssueCard } from "./IssueCard";
import { ARRAY_INDEX, DRAG_OVERLAY_STYLE } from "../../constants/kanban";
import type { DragData } from "../../types";

const isDragData = (data: unknown): data is DragData => {
  if (data === null || typeof data !== "object") {
    return false;
  }
  if (!("type" in data)) {
    return false;
  }
  const { type } = data;
  return type === "issue" || type === "column";
};

export const KanbanBoard = () => {
  const columns = useAtomValue(sortedColumnsAtom);
  const issuesByColumn = useAtomValue(issuesByColumnAtom);
  const issuesMap = useAtomValue(issuesMapAtom);
  const moveIssue = useSetAtom(moveIssueAtom);
  const reorderIssue = useSetAtom(reorderIssueAtom);
  const reorderColumns = useSetAtom(reorderColumnsAtom);
  const initializeIssues = useSetAtom(initializeIssuesAtom);

  const [activeId, setActiveId] = useState<UniqueIdentifier | undefined>(
    );
  const [activeSourceColumnId, setActiveSourceColumnId] = useState<
    string | undefined
  >();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV) {
      void import("../../mocks/kanbanData").then(({ MOCK_ISSUES }) => {
        initializeIssues(MOCK_ISSUES);
      });
    }
  }, [initializeIssues]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
    const data = event.active.data.current;
    if (isDragData(data) && data.type === "issue" && data.sourceColumnId !== undefined) {
      setActiveSourceColumnId(data.sourceColumnId);
    }
  };

  const handleColumnReorder = (activeId: string, overId: string) => {
    if (activeId !== overId) {
      reorderColumns({ activeId, overId });
    }
  };

  const handleIssueReorder = (
    sourceColumnId: string,
    activeId: string,
    overId: string
  ) => {
    reorderIssue({ columnId: sourceColumnId, activeId, overId });
  };

  const handleIssueMoveToIssue = (
    activeId: string,
    sourceColumnId: string,
    targetColumnId: string,
    overId: string
  ) => {
    const targetIssueIds = issuesByColumn[targetColumnId] ?? [];
    const targetIndex = targetIssueIds.indexOf(overId);
    moveIssue({
      issueId: activeId,
      sourceColumnId,
      targetColumnId,
      targetIndex:
        targetIndex >= ARRAY_INDEX.FIRST ? targetIndex : ARRAY_INDEX.FIRST,
    });
  };

  const handleIssueMoveToColumn = (
    activeId: string,
    sourceColumnId: string,
    targetColumnId: string
  ) => {
    const targetIssueIds = issuesByColumn[targetColumnId] ?? [];
    moveIssue({
      issueId: activeId,
      sourceColumnId,
      targetColumnId,
      targetIndex: targetIssueIds.length,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(undefined);
    setActiveSourceColumnId(undefined);

    if (over === null) {
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!isDragData(activeData) || !isDragData(overData)) {
      return;
    }

    if (activeData.type === "column" && overData.type === "column") {
      handleColumnReorder(String(active.id), String(over.id));
      return;
    }

    if (activeData.type === "issue" && activeData.sourceColumnId !== undefined) {
      const { sourceColumnId } = activeData;

      if (overData.type === "issue" && overData.sourceColumnId !== undefined) {
        const { sourceColumnId: targetColumnId } = overData;
        if (sourceColumnId === targetColumnId) {
          handleIssueReorder(sourceColumnId, String(active.id), String(over.id));
        } else {
          handleIssueMoveToIssue(
            String(active.id),
            sourceColumnId,
            targetColumnId,
            String(over.id)
          );
        }
        return;
      }

      if (overData.type === "column" && overData.columnId !== undefined) {
        const { columnId: targetColumnId } = overData;
        if (sourceColumnId !== targetColumnId) {
          handleIssueMoveToColumn(String(active.id), sourceColumnId, targetColumnId);
        }
      }
    }
  };

  const activeIssue =
    activeId === undefined ? undefined : issuesMap[String(activeId)];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
        <h2 className="text-lg font-semibold text-gray-100">Kanban Board</h2>
        <button
          onClick={() => { setIsSettingsOpen(true); }}
          className="rounded p-2 text-gray-400 hover:bg-gray-700 hover:text-gray-100"
        >
          Settings
        </button>
      </div>

      <DndContext
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 gap-4 overflow-x-auto p-4">
          <SortableContext
            items={columns.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((column) => (
              <KanbanColumn key={column.id} column={column} />
            ))}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeIssue !== undefined && activeSourceColumnId !== undefined && (
            <div className={DRAG_OVERLAY_STYLE}>
              <IssueCard issue={activeIssue} columnId={activeSourceColumnId} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {isSettingsOpen && (
        <ColumnSettings onClose={() => { setIsSettingsOpen(false); }} />
      )}
    </div>
  );
};

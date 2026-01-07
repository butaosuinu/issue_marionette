import {
  DndContext,
  pointerWithin,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
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
import { DRAG_OVERLAY_STYLE } from "../../constants/kanban";
import type { DragData } from "../../types";

export const KanbanBoard = () => {
  const columns = useAtomValue(sortedColumnsAtom);
  const issuesByColumn = useAtomValue(issuesByColumnAtom);
  const issuesMap = useAtomValue(issuesMapAtom);
  const moveIssue = useSetAtom(moveIssueAtom);
  const reorderIssue = useSetAtom(reorderIssueAtom);
  const reorderColumns = useSetAtom(reorderColumnsAtom);
  const initializeIssues = useSetAtom(initializeIssuesAtom);

  const [activeId, setActiveId] = useState<UniqueIdentifier | undefined>(
    undefined
  );
  const [activeSourceColumnId, setActiveSourceColumnId] = useState<
    string | undefined
  >(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV) {
      import("../../mocks/kanbanData").then(({ MOCK_ISSUES }) => {
        initializeIssues(MOCK_ISSUES);
      });
    }
  }, [initializeIssues]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
    const data = event.active.data.current as DragData | undefined;
    if (data?.type === "issue" && data.sourceColumnId !== undefined) {
      setActiveSourceColumnId(data.sourceColumnId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(undefined);
    setActiveSourceColumnId(undefined);

    if (over === undefined || over === null) {
      return;
    }

    const activeData = active.data.current as DragData | undefined;
    const overData = over.data.current as DragData | undefined;

    if (activeData === undefined || overData === undefined) {
      return;
    }

    if (activeData.type === "column" && overData.type === "column") {
      if (active.id !== over.id) {
        reorderColumns({
          activeId: active.id as string,
          overId: over.id as string,
        });
      }
      return;
    }

    if (activeData.type === "issue" && activeData.sourceColumnId !== undefined) {
      const sourceColumnId = activeData.sourceColumnId;

      if (overData.type === "issue" && overData.sourceColumnId !== undefined) {
        const targetColumnId = overData.sourceColumnId;

        if (sourceColumnId === targetColumnId) {
          reorderIssue({
            columnId: sourceColumnId,
            activeId: active.id as string,
            overId: over.id as string,
          });
        } else {
          const targetIssueIds = issuesByColumn[targetColumnId] ?? [];
          const targetIndex = targetIssueIds.indexOf(over.id as string);
          moveIssue({
            issueId: active.id as string,
            sourceColumnId,
            targetColumnId,
            targetIndex: targetIndex >= 0 ? targetIndex : 0,
          });
        }
        return;
      }

      if (overData.type === "column" && overData.columnId !== undefined) {
        const targetColumnId = overData.columnId;
        if (sourceColumnId !== targetColumnId) {
          const targetIssueIds = issuesByColumn[targetColumnId] ?? [];
          moveIssue({
            issueId: active.id as string,
            sourceColumnId,
            targetColumnId,
            targetIndex: targetIssueIds.length,
          });
        }
      }
    }
  };

  const activeIssue =
    activeId !== undefined ? issuesMap[activeId as string] : undefined;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
        <h2 className="text-lg font-semibold text-gray-100">Kanban Board</h2>
        <button
          onClick={() => setIsSettingsOpen(true)}
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
        <ColumnSettings onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
};

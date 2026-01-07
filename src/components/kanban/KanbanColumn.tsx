import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAtomValue } from "jotai";
import { issuesByColumnAtom, issuesMapAtom } from "../../stores";
import { IssueCard } from "./IssueCard";
import type { KanbanColumn as KanbanColumnType } from "../../types";

type Props = {
  column: KanbanColumnType;
};

export const KanbanColumn = ({ column }: Props) => {
  const issuesByColumn = useAtomValue(issuesByColumnAtom);
  const issuesMap = useAtomValue(issuesMapAtom);

  const issueIds = issuesByColumn[column.id] ?? [];
  const issues = issueIds
    .map((id) => issuesMap[id])
    .filter((issue) => issue !== undefined);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column" as const, columnId: column.id },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `droppable-${column.id}`,
    data: { type: "column" as const, columnId: column.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className="flex w-72 shrink-0 flex-col rounded-lg bg-gray-800"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-center justify-between border-b border-gray-700 px-3 py-2"
        style={{ borderTopColor: column.color, borderTopWidth: 3 }}
      >
        <h3 className="font-medium text-gray-100">{column.title}</h3>
        <span className="rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-400">
          {issues.length}
        </span>
      </div>

      <div ref={setDroppableRef} className="flex-1 overflow-y-auto p-2">
        <SortableContext
          items={issueIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} columnId={column.id} />
            ))}
          </div>
        </SortableContext>
        {issues.length === 0 && (
          <div className="flex h-20 items-center justify-center text-sm text-gray-500">
            ドロップしてカードを追加
          </div>
        )}
      </div>
    </div>
  );
};

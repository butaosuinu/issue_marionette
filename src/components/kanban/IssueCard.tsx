import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Issue } from "../../types";
import {
  ARRAY_INDEX,
  LABEL_DISPLAY,
  PRIORITY_COLORS,
  STYLE_VALUES,
} from "../../constants/kanban";

type Props = {
  issue: Issue;
  columnId: string;
};

export const IssueCard = ({ issue, columnId }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: issue.id,
    data: {
      type: "issue" as const,
      issueId: issue.id,
      sourceColumnId: columnId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging
      ? STYLE_VALUES.OPACITY_DRAGGING
      : STYLE_VALUES.OPACITY_DEFAULT,
  };

  const priorityColor = PRIORITY_COLORS[issue.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded border border-gray-700 bg-gray-900 p-3 hover:border-gray-600"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-gray-500">#{issue.number}</span>
        <div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: priorityColor }}
          title={issue.priority}
        />
      </div>

      <h4 className="mt-1 line-clamp-2 text-sm font-medium text-gray-100">
        {issue.title}
      </h4>

      {issue.labels.length > ARRAY_INDEX.FIRST && (
        <div className="mt-2 flex flex-wrap gap-1">
          {issue.labels.slice(ARRAY_INDEX.FIRST, LABEL_DISPLAY.MAX_VISIBLE).map((label) => (
            <span
              key={label.id}
              className="rounded px-1.5 py-0.5 text-xs"
              style={{
                backgroundColor: `${label.color}30`,
                color: label.color,
              }}
            >
              {label.name}
            </span>
          ))}
          {issue.labels.length > LABEL_DISPLAY.MAX_VISIBLE && (
            <span className="rounded px-1.5 py-0.5 text-xs text-gray-400">
              +{issue.labels.length - LABEL_DISPLAY.MAX_VISIBLE}
            </span>
          )}
        </div>
      )}

      {issue.assignee !== undefined && (
        <div className="mt-2 text-xs text-gray-500">{issue.assignee}</div>
      )}
    </div>
  );
};

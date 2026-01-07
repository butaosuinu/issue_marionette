import type { KanbanColumn, IssuePriority } from "../types";

export const DEFAULT_COLUMNS: readonly KanbanColumn[] = Object.freeze([
  { id: "backlog", title: "Backlog", order: 0, isDefault: true, color: "#6B7280" },
  { id: "todo", title: "Todo", order: 1, isDefault: true, color: "#3B82F6" },
  {
    id: "in-progress",
    title: "In Progress",
    order: 2,
    isDefault: true,
    color: "#F59E0B",
  },
  { id: "review", title: "Review", order: 3, isDefault: true, color: "#8B5CF6" },
  { id: "done", title: "Done", order: 4, isDefault: true, color: "#10B981" },
]);

export const PRIORITY_COLORS: Readonly<Record<IssuePriority, string>> =
  Object.freeze({
    low: "#6B7280",
    medium: "#3B82F6",
    high: "#F59E0B",
    urgent: "#EF4444",
  });

export const PRIORITY_LABELS: Readonly<Record<IssuePriority, string>> =
  Object.freeze({
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
  });

export const DRAG_OVERLAY_STYLE = "rotate-3 opacity-90";

export type IssuePriority = "low" | "medium" | "high" | "urgent";

export type IssueLabel = {
  id: string;
  name: string;
  color: string;
};

export type Issue = {
  id: string;
  number: number;
  title: string;
  body: string;
  state: "open" | "closed";
  priority: IssuePriority;
  labels: IssueLabel[];
  assignee: string | undefined;
  createdAt: string;
  updatedAt: string;
  columnId: string;
};

export type KanbanColumn = {
  id: string;
  title: string;
  order: number;
  isDefault: boolean;
  color: string;
};

export type DragItemType = "issue" | "column";

export type DragData = {
  type: DragItemType;
  issueId?: string;
  columnId?: string;
  sourceColumnId?: string;
};

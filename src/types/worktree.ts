export type WorktreeStatus =
  | "creating"
  | "ready"
  | "working"
  | "reviewing"
  | "merged";

export type Worktree = {
  id: string;
  repository_id: string;
  issue_number: number | undefined;
  branch_name: string;
  path: string;
  status: WorktreeStatus;
  created_at: string;
  updated_at: string;
};

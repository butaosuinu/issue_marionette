type GitHubIssueLabel = {
  id: number;
  name: string;
  color: string;
};

type GitHubIssueAssignee = {
  id: number;
  login: string;
  avatar_url: string;
};

type GitHubIssueUser = {
  id: number;
  login: string;
  avatar_url: string;
};

type GitHubIssuePullRequestLink = {
  url: string;
  html_url: string;
};

type GitHubIssueMilestone = {
  id: number;
  title: string;
  due_on: string | undefined;
};

export type GitHubIssue = {
  id: number;
  number: number;
  title: string;
  body: string | undefined;
  state: "open" | "closed";
  labels: GitHubIssueLabel[];
  milestone: GitHubIssueMilestone | undefined;
  assignees: GitHubIssueAssignee[];
  user: GitHubIssueUser;
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | undefined;
  pull_request: GitHubIssuePullRequestLink | undefined;
};

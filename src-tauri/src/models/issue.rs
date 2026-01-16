use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum IssueState {
    Open,
    Closed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ListIssuesStateFilter {
    Open,
    Closed,
    All,
}

impl ListIssuesStateFilter {
    pub fn as_str(&self) -> &'static str {
        match self {
            ListIssuesStateFilter::Open => "open",
            ListIssuesStateFilter::Closed => "closed",
            ListIssuesStateFilter::All => "all",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum IssueSortField {
    Created,
    Updated,
    Comments,
}

impl IssueSortField {
    pub fn as_str(&self) -> &'static str {
        match self {
            IssueSortField::Created => "created",
            IssueSortField::Updated => "updated",
            IssueSortField::Comments => "comments",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SortDirection {
    Asc,
    Desc,
}

impl SortDirection {
    pub fn as_str(&self) -> &'static str {
        match self {
            SortDirection::Asc => "asc",
            SortDirection::Desc => "desc",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IssueLabel {
    pub id: i64,
    pub name: String,
    pub color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IssueMilestone {
    pub id: i64,
    pub title: String,
    pub due_on: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IssueAssignee {
    pub id: i64,
    pub login: String,
    pub avatar_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IssueUser {
    pub id: i64,
    pub login: String,
    pub avatar_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IssuePullRequestLink {
    pub url: String,
    pub html_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Issue {
    pub id: i64,
    pub number: i32,
    pub title: String,
    pub body: Option<String>,
    pub state: IssueState,
    pub labels: Vec<IssueLabel>,
    pub milestone: Option<IssueMilestone>,
    pub assignees: Vec<IssueAssignee>,
    pub user: IssueUser,
    pub html_url: String,
    pub created_at: String,
    pub updated_at: String,
    pub closed_at: Option<String>,
    pub pull_request: Option<IssuePullRequestLink>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Label {
    pub id: i64,
    pub name: String,
    pub color: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MilestoneState {
    Open,
    Closed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Milestone {
    pub id: i64,
    pub number: i32,
    pub title: String,
    pub description: Option<String>,
    pub state: MilestoneState,
    pub due_on: Option<String>,
    pub open_issues: i32,
    pub closed_issues: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PullRequestRef {
    pub label: String,
    #[serde(rename = "ref")]
    pub ref_name: String,
    pub sha: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PullRequestState {
    Open,
    Closed,
    Merged,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PullRequest {
    pub id: i64,
    pub number: i32,
    pub title: String,
    pub body: Option<String>,
    pub state: PullRequestState,
    pub html_url: String,
    pub head: PullRequestRef,
    pub base: PullRequestRef,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct CreatePullRequestRequest {
    pub title: String,
    pub body: Option<String>,
    pub head: String,
    pub base: String,
    pub draft: Option<bool>,
}

#[derive(Debug, Clone, Default)]
pub struct ListIssuesParams {
    pub state: Option<ListIssuesStateFilter>,
    pub labels: Option<String>,
    pub milestone: Option<String>,
    pub assignee: Option<String>,
    pub sort: Option<IssueSortField>,
    pub direction: Option<SortDirection>,
    pub per_page: Option<u32>,
    pub page: Option<u32>,
}

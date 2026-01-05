use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum IssueState {
    Open,
    Closed,
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
pub struct Issue {
    pub id: i64,
    pub number: i32,
    pub title: String,
    pub body: Option<String>,
    pub state: IssueState,
    pub labels: Vec<IssueLabel>,
    pub milestone: Option<IssueMilestone>,
    pub assignees: Vec<IssueAssignee>,
    pub repository_id: String,
    pub created_at: String,
    pub updated_at: String,
    pub closed_at: Option<String>,
}

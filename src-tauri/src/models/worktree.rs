use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum WorktreeStatus {
    Creating,
    Ready,
    Working,
    Reviewing,
    Merged,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Worktree {
    pub id: String,
    pub repository_id: String,
    pub issue_number: i32,
    pub branch_name: String,
    pub path: String,
    pub status: WorktreeStatus,
    pub created_at: String,
    pub updated_at: String,
}

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Repository {
    pub id: String,
    pub owner: String,
    pub name: String,
    pub full_name: String,
    pub local_path: String,
    pub default_branch: String,
    pub is_private: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepositoryFormData {
    pub owner: String,
    pub name: String,
    pub local_path: String,
}

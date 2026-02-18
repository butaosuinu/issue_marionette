use crate::models::Repository;
use crate::services::RepositoryStore;
use tauri::{command, AppHandle};

#[command]
pub async fn save_repository(app: AppHandle, repository: Repository) -> Result<(), String> {
    RepositoryStore::save(&app, repository)
}

#[command]
pub async fn load_repositories(app: AppHandle) -> Result<Vec<Repository>, String> {
    RepositoryStore::load_all(&app)
}

#[command]
pub async fn delete_repository(app: AppHandle, id: String) -> Result<(), String> {
    RepositoryStore::delete(&app, &id)
}

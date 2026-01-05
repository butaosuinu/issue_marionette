use crate::models::Repository;
use tauri::command;

#[command]
pub async fn save_repository(_repository: Repository) -> Result<(), String> {
    // TODO: Implement repository save
    Ok(())
}

#[command]
pub async fn load_repositories() -> Result<Vec<Repository>, String> {
    // TODO: Implement repository load
    Ok(vec![])
}

#[command]
pub async fn delete_repository(_repo_id: String) -> Result<(), String> {
    // TODO: Implement repository delete
    Ok(())
}

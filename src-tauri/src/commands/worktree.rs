use crate::models::Worktree;
use tauri::command;

#[command]
pub async fn create_worktree(
    _repo_path: String,
    _issue_number: i32,
    _branch_name: String,
) -> Result<Worktree, String> {
    // TODO: Implement worktree creation
    Err("Not implemented".to_string())
}

#[command]
pub async fn list_worktrees(_repo_path: String) -> Result<Vec<Worktree>, String> {
    // TODO: Implement worktree listing
    Ok(vec![])
}

#[command]
pub async fn remove_worktree(_worktree_path: String, _force: bool) -> Result<(), String> {
    // TODO: Implement worktree removal
    Ok(())
}

#[command]
pub async fn get_worktree_diff(_worktree_path: String) -> Result<String, String> {
    // TODO: Implement diff retrieval
    Ok(String::new())
}

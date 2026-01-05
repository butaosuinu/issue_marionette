use crate::models::{AgentMode, AgentSession, AgentStatus};
use tauri::command;

#[command]
pub async fn start_agent(
    _worktree_path: String,
    _issue_context: String,
    _mode: AgentMode,
) -> Result<AgentSession, String> {
    // TODO: Implement agent start
    Err("Not implemented".to_string())
}

#[command]
pub async fn stop_agent(_session_id: String) -> Result<(), String> {
    // TODO: Implement agent stop
    Ok(())
}

#[command]
pub async fn send_agent_input(_session_id: String, _input: String) -> Result<(), String> {
    // TODO: Implement agent input
    Ok(())
}

#[command]
pub async fn get_agent_status(_session_id: String) -> Result<AgentStatus, String> {
    // TODO: Implement status retrieval
    Err("Not implemented".to_string())
}

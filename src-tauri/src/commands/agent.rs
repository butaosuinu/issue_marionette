use crate::models::{AgentMode, AgentSession, AgentStatus};
use crate::services::AgentManager;
use std::sync::{Arc, Mutex};
use tauri::{command, AppHandle, State};

#[command]
pub async fn start_agent(
    state: State<'_, Arc<Mutex<AgentManager>>>,
    app_handle: AppHandle,
    worktree_path: String,
    issue_context: String,
    mode: AgentMode,
) -> Result<AgentSession, String> {
    let mut manager = state.lock().map_err(|e| e.to_string())?;
    manager.create_session(app_handle, worktree_path, issue_context, mode, 80, 24)
}

#[command]
pub async fn stop_agent(
    state: State<'_, Arc<Mutex<AgentManager>>>,
    session_id: String,
) -> Result<(), String> {
    let mut manager = state.lock().map_err(|e| e.to_string())?;
    manager.close(&session_id)
}

#[command]
pub async fn send_agent_input(
    state: State<'_, Arc<Mutex<AgentManager>>>,
    session_id: String,
    input: String,
) -> Result<(), String> {
    let manager = state.lock().map_err(|e| e.to_string())?;
    manager.write(&session_id, input.as_bytes())
}

#[command]
pub async fn get_agent_status(
    state: State<'_, Arc<Mutex<AgentManager>>>,
    session_id: String,
) -> Result<AgentStatus, String> {
    let manager = state.lock().map_err(|e| e.to_string())?;
    manager
        .get_status(&session_id)
        .ok_or_else(|| format!("Session not found: {}", session_id))
}

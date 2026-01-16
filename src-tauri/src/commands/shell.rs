use crate::services::PtyManager;
use std::sync::Arc;
use std::sync::Mutex;
use tauri::{command, AppHandle, State};

#[command]
pub fn create_pty_session(
    app: AppHandle,
    state: State<'_, Arc<Mutex<PtyManager>>>,
    working_dir: String,
    cols: u16,
    rows: u16,
) -> Result<String, String> {
    let mut manager = state
        .lock()
        .map_err(|e| format!("Failed to lock PtyManager: {}", e))?;
    manager.create_session(app, working_dir, cols, rows)
}

#[command]
pub fn write_pty(
    state: State<'_, Arc<Mutex<PtyManager>>>,
    session_id: String,
    data: Vec<u8>,
) -> Result<(), String> {
    let manager = state
        .lock()
        .map_err(|e| format!("Failed to lock PtyManager: {}", e))?;
    manager.write(&session_id, &data)
}

#[command]
pub fn resize_pty(
    state: State<'_, Arc<Mutex<PtyManager>>>,
    session_id: String,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    let manager = state
        .lock()
        .map_err(|e| format!("Failed to lock PtyManager: {}", e))?;
    manager.resize(&session_id, cols, rows)
}

#[command]
pub fn close_pty(
    state: State<'_, Arc<Mutex<PtyManager>>>,
    session_id: String,
) -> Result<(), String> {
    let mut manager = state
        .lock()
        .map_err(|e| format!("Failed to lock PtyManager: {}", e))?;
    manager.close(&session_id)
}

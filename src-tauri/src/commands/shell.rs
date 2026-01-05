use tauri::command;

#[command]
pub async fn create_pty_session(
    _working_dir: String,
    _cols: u16,
    _rows: u16,
) -> Result<String, String> {
    // TODO: Implement PTY session creation
    Err("Not implemented".to_string())
}

#[command]
pub async fn write_pty(_session_id: String, _data: Vec<u8>) -> Result<(), String> {
    // TODO: Implement PTY write
    Ok(())
}

#[command]
pub async fn resize_pty(_session_id: String, _cols: u16, _rows: u16) -> Result<(), String> {
    // TODO: Implement PTY resize
    Ok(())
}

#[command]
pub async fn close_pty(_session_id: String) -> Result<(), String> {
    // TODO: Implement PTY close
    Ok(())
}

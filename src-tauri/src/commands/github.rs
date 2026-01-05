use tauri::command;

#[command]
pub async fn start_oauth_flow() -> Result<String, String> {
    // TODO: Implement OAuth flow
    Ok("https://github.com/login/oauth/authorize".to_string())
}

#[command]
pub async fn exchange_oauth_code(code: String, _state: String) -> Result<String, String> {
    // TODO: Implement token exchange
    let _ = code;
    Err("Not implemented".to_string())
}

#[command]
pub async fn get_authenticated_user(_token: String) -> Result<serde_json::Value, String> {
    // TODO: Implement user fetch
    Err("Not implemented".to_string())
}

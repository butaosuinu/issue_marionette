use crate::services::{GitHubClient, GitHubUser, OAuthConfig, StoredAuth, TokenStore};
use chrono::Utc;
use once_cell::sync::Lazy;
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{command, AppHandle};

static PENDING_STATES: Lazy<Mutex<HashMap<String, chrono::DateTime<Utc>>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

#[command]
pub async fn start_oauth_flow(_app: AppHandle) -> Result<String, String> {
    let config = OAuthConfig::from_env()?;
    let state = OAuthConfig::generate_state();

    {
        let mut states = PENDING_STATES.lock().map_err(|e| e.to_string())?;
        states.insert(state.clone(), Utc::now());

        let now = Utc::now();
        states.retain(|_, created| now.signed_duration_since(*created).num_minutes() < 5);
    }

    let auth_url = config.generate_auth_url(&state);

    tauri_plugin_opener::open_url(&auth_url, None::<&str>)
        .map_err(|e| format!("Failed to open browser: {}", e))?;

    Ok(state)
}

#[command]
pub async fn exchange_oauth_code(
    app: AppHandle,
    code: String,
    state: String,
) -> Result<GitHubUser, String> {
    {
        let mut states = PENDING_STATES.lock().map_err(|e| e.to_string())?;
        match states.remove(&state) {
            Some(created_at) => {
                let now = Utc::now();
                if now.signed_duration_since(created_at).num_minutes() >= 5 {
                    return Err("State has expired".to_string());
                }
            }
            None => {
                return Err("Invalid or expired state".to_string());
            }
        }
    }

    let config = OAuthConfig::from_env()?;
    let token_response = config.exchange_code(&code).await?;

    let stored_auth = StoredAuth {
        access_token: token_response.access_token.clone(),
        token_type: token_response.token_type,
        scope: token_response.scope,
        stored_at: Utc::now().to_rfc3339(),
    };
    TokenStore::save_token(&app, &stored_auth)?;

    let client = GitHubClient::with_token(token_response.access_token);
    let user = client.get_authenticated_user().await?;

    TokenStore::save_user(&app, &user)?;

    Ok(user)
}

#[command]
pub async fn get_authenticated_user(app: AppHandle) -> Result<Option<GitHubUser>, String> {
    if let Some(user) = TokenStore::load_user(&app)? {
        return Ok(Some(user));
    }

    if let Some(auth) = TokenStore::load_token(&app)? {
        let client = GitHubClient::with_token(auth.access_token);
        let user = client.get_authenticated_user().await?;
        TokenStore::save_user(&app, &user)?;
        return Ok(Some(user));
    }

    Ok(None)
}

#[command]
pub async fn logout(app: AppHandle) -> Result<(), String> {
    TokenStore::clear_token(&app)?;
    Ok(())
}

#[command]
pub async fn get_stored_token(app: AppHandle) -> Result<Option<String>, String> {
    match TokenStore::load_token(&app)? {
        Some(auth) => Ok(Some(auth.access_token)),
        None => Ok(None),
    }
}

// Token storage using tauri-plugin-store.
// Note: Tokens are stored in the app's sandbox directory without additional encryption.
// For enhanced security, consider migrating to macOS Keychain (keychain-services crate)
// or other platform-specific secure storage solutions.

use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

use super::github_client::GitHubUser;

const STORE_PATH: &str = "auth.json";
const TOKEN_KEY: &str = "github_access_token";
const USER_KEY: &str = "github_user";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoredAuth {
    pub access_token: String,
    pub token_type: String,
    pub scope: String,
    pub stored_at: String,
}

pub struct TokenStore;

impl TokenStore {
    pub fn save_token(app: &AppHandle, auth: &StoredAuth) -> Result<(), String> {
        let store = app
            .store(STORE_PATH)
            .map_err(|e| format!("Failed to open store: {}", e))?;

        store.set(
            TOKEN_KEY,
            serde_json::to_value(auth).map_err(|e| format!("Failed to serialize: {}", e))?,
        );

        store
            .save()
            .map_err(|e| format!("Failed to save store: {}", e))?;

        Ok(())
    }

    pub fn load_token(app: &AppHandle) -> Result<Option<StoredAuth>, String> {
        let store = app
            .store(STORE_PATH)
            .map_err(|e| format!("Failed to open store: {}", e))?;

        match store.get(TOKEN_KEY) {
            Some(value) => {
                let auth: StoredAuth = serde_json::from_value(value.clone())
                    .map_err(|e| format!("Failed to deserialize: {}", e))?;
                Ok(Some(auth))
            }
            None => Ok(None),
        }
    }

    pub fn clear_token(app: &AppHandle) -> Result<(), String> {
        let store = app
            .store(STORE_PATH)
            .map_err(|e| format!("Failed to open store: {}", e))?;

        store.delete(TOKEN_KEY);
        store.delete(USER_KEY);

        store
            .save()
            .map_err(|e| format!("Failed to save store: {}", e))?;

        Ok(())
    }

    pub fn save_user(app: &AppHandle, user: &GitHubUser) -> Result<(), String> {
        let store = app
            .store(STORE_PATH)
            .map_err(|e| format!("Failed to open store: {}", e))?;

        store.set(
            USER_KEY,
            serde_json::to_value(user).map_err(|e| format!("Failed to serialize: {}", e))?,
        );

        store
            .save()
            .map_err(|e| format!("Failed to save store: {}", e))?;

        Ok(())
    }

    pub fn load_user(app: &AppHandle) -> Result<Option<GitHubUser>, String> {
        let store = app
            .store(STORE_PATH)
            .map_err(|e| format!("Failed to open store: {}", e))?;

        match store.get(USER_KEY) {
            Some(value) => {
                let user: GitHubUser = serde_json::from_value(value.clone())
                    .map_err(|e| format!("Failed to deserialize: {}", e))?;
                Ok(Some(user))
            }
            None => Ok(None),
        }
    }
}

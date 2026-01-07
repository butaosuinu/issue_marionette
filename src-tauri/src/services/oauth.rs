use reqwest::Client;
use serde::{Deserialize, Serialize};

const GITHUB_CLIENT_ID: Option<&str> = option_env!("GITHUB_CLIENT_ID");
const GITHUB_CLIENT_SECRET: Option<&str> = option_env!("GITHUB_CLIENT_SECRET");

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenResponse {
    pub access_token: String,
    pub token_type: String,
    pub scope: String,
}

pub struct OAuthConfig {
    pub client_id: String,
    pub client_secret: String,
    pub redirect_uri: String,
    pub scopes: Vec<String>,
}

impl OAuthConfig {
    pub fn new(client_id: String, client_secret: String, redirect_uri: String) -> Self {
        Self {
            client_id,
            client_secret,
            redirect_uri,
            scopes: vec!["repo".to_string(), "user".to_string()],
        }
    }

    pub fn from_env() -> Result<Self, String> {
        let client_id = GITHUB_CLIENT_ID
            .ok_or_else(|| "GITHUB_CLIENT_ID not configured at compile time".to_string())?;
        let client_secret = GITHUB_CLIENT_SECRET
            .ok_or_else(|| "GITHUB_CLIENT_SECRET not configured at compile time".to_string())?;

        Ok(Self::new(
            client_id.to_string(),
            client_secret.to_string(),
            "issue-marionette://oauth-callback".to_string(),
        ))
    }

    pub fn generate_state() -> String {
        uuid::Uuid::new_v4().to_string()
    }

    pub fn generate_auth_url(&self, state: &str) -> String {
        format!(
            "https://github.com/login/oauth/authorize?client_id={}&redirect_uri={}&scope={}&state={}",
            self.client_id,
            urlencoding::encode(&self.redirect_uri),
            self.scopes.join(" "),
            state
        )
    }

    pub async fn exchange_code(&self, code: &str) -> Result<TokenResponse, String> {
        let client = Client::new();

        let params = [
            ("client_id", self.client_id.as_str()),
            ("client_secret", self.client_secret.as_str()),
            ("code", code),
            ("redirect_uri", self.redirect_uri.as_str()),
        ];

        let response = client
            .post("https://github.com/login/oauth/access_token")
            .header("Accept", "application/json")
            .form(&params)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        if response.status().is_success() {
            let token_response: TokenResponse = response
                .json()
                .await
                .map_err(|e| format!("Failed to parse response: {}", e))?;

            if token_response.access_token.is_empty() {
                return Err("GitHub returned an error (invalid code or expired)".to_string());
            }

            Ok(token_response)
        } else {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            Err(format!("GitHub OAuth error ({}): {}", status, body))
        }
    }
}

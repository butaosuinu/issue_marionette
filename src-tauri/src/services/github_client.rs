use reqwest::Client;
use serde::{Deserialize, Serialize};

const GITHUB_API_BASE: &str = "https://api.github.com";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubUser {
    pub id: i64,
    pub login: String,
    pub name: Option<String>,
    pub email: Option<String>,
    pub avatar_url: String,
}

pub struct GitHubClient {
    client: Client,
    token: Option<String>,
}

impl GitHubClient {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
            token: None,
        }
    }

    pub fn with_token(token: String) -> Self {
        Self {
            client: Client::new(),
            token: Some(token),
        }
    }

    pub fn set_token(&mut self, token: String) {
        self.token = Some(token);
    }

    pub fn client(&self) -> &Client {
        &self.client
    }

    pub fn token(&self) -> Option<&String> {
        self.token.as_ref()
    }

    pub async fn get_authenticated_user(&self) -> Result<GitHubUser, String> {
        let token = self
            .token
            .as_ref()
            .ok_or_else(|| "No token set".to_string())?;

        let response = self
            .client
            .get(format!("{}/user", GITHUB_API_BASE))
            .header("Authorization", format!("Bearer {}", token))
            .header("User-Agent", "issue-marionette")
            .header("Accept", "application/vnd.github+json")
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        if response.status().is_success() {
            response
                .json()
                .await
                .map_err(|e| format!("Failed to parse user: {}", e))
        } else {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            Err(format!("GitHub API error ({}): {}", status, body))
        }
    }
}

impl Default for GitHubClient {
    fn default() -> Self {
        Self::new()
    }
}

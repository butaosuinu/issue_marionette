use crate::models::{
    CreatePullRequestRequest, Issue, IssueSortField, Label, ListIssuesParams,
    ListIssuesStateFilter, Milestone, PullRequest, SortDirection,
};
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

#[allow(clippy::too_many_arguments)]
#[command]
pub async fn list_issues(
    app: AppHandle,
    owner: String,
    repo: String,
    state: Option<ListIssuesStateFilter>,
    labels: Option<String>,
    milestone: Option<String>,
    assignee: Option<String>,
    sort: Option<IssueSortField>,
    direction: Option<SortDirection>,
    per_page: Option<u32>,
    page: Option<u32>,
    exclude_pull_requests: Option<bool>,
) -> Result<Vec<Issue>, String> {
    let auth = TokenStore::load_token(&app)?.ok_or_else(|| "Not authenticated".to_string())?;

    let client = GitHubClient::with_token(auth.access_token);

    let params = ListIssuesParams {
        state,
        labels,
        milestone,
        assignee,
        sort,
        direction,
        per_page,
        page,
    };

    let issues = client.list_issues(&owner, &repo, &params).await?;

    if exclude_pull_requests.unwrap_or(false) {
        Ok(issues
            .into_iter()
            .filter(|issue| issue.pull_request.is_none())
            .collect())
    } else {
        Ok(issues)
    }
}

#[command]
pub async fn get_issue(
    app: AppHandle,
    owner: String,
    repo: String,
    issue_number: i32,
) -> Result<Issue, String> {
    let auth = TokenStore::load_token(&app)?.ok_or_else(|| "Not authenticated".to_string())?;

    let client = GitHubClient::with_token(auth.access_token);
    client.get_issue(&owner, &repo, issue_number).await
}

#[command]
pub async fn list_labels(
    app: AppHandle,
    owner: String,
    repo: String,
) -> Result<Vec<Label>, String> {
    let auth = TokenStore::load_token(&app)?.ok_or_else(|| "Not authenticated".to_string())?;

    let client = GitHubClient::with_token(auth.access_token);
    client.list_labels(&owner, &repo).await
}

#[command]
pub async fn list_milestones(
    app: AppHandle,
    owner: String,
    repo: String,
) -> Result<Vec<Milestone>, String> {
    let auth = TokenStore::load_token(&app)?.ok_or_else(|| "Not authenticated".to_string())?;

    let client = GitHubClient::with_token(auth.access_token);
    client.list_milestones(&owner, &repo).await
}

#[allow(clippy::too_many_arguments)]
#[command]
pub async fn create_pull_request(
    app: AppHandle,
    owner: String,
    repo: String,
    title: String,
    body: Option<String>,
    head: String,
    base: String,
    draft: Option<bool>,
) -> Result<PullRequest, String> {
    let auth = TokenStore::load_token(&app)?.ok_or_else(|| "Not authenticated".to_string())?;

    let client = GitHubClient::with_token(auth.access_token);

    let request = CreatePullRequestRequest {
        title,
        body,
        head,
        base,
        draft,
    };

    client.create_pull_request(&owner, &repo, &request).await
}

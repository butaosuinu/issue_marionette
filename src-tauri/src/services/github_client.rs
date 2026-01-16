use crate::models::{
    CreatePullRequestRequest, Issue, Label, ListIssuesParams, Milestone, PullRequest,
};
use reqwest::Client;
use serde::de::DeserializeOwned;
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

    async fn get_request<T: DeserializeOwned>(&self, url: &str) -> Result<T, String> {
        let token = self
            .token
            .as_ref()
            .ok_or_else(|| "No token set".to_string())?;

        let response = self
            .client
            .get(url)
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
                .map_err(|e| format!("Failed to parse response: {}", e))
        } else {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            Err(format!("GitHub API error ({}): {}", status, body))
        }
    }

    async fn post_request<T: DeserializeOwned, B: Serialize>(
        &self,
        url: &str,
        body: &B,
    ) -> Result<T, String> {
        let token = self
            .token
            .as_ref()
            .ok_or_else(|| "No token set".to_string())?;

        let response = self
            .client
            .post(url)
            .header("Authorization", format!("Bearer {}", token))
            .header("User-Agent", "issue-marionette")
            .header("Accept", "application/vnd.github+json")
            .json(body)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        if response.status().is_success() {
            response
                .json()
                .await
                .map_err(|e| format!("Failed to parse response: {}", e))
        } else {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            Err(format!("GitHub API error ({}): {}", status, body))
        }
    }

    pub async fn get_authenticated_user(&self) -> Result<GitHubUser, String> {
        let url = format!("{}/user", GITHUB_API_BASE);
        self.get_request(&url).await
    }

    pub async fn list_issues(
        &self,
        owner: &str,
        repo: &str,
        params: &ListIssuesParams,
    ) -> Result<Vec<Issue>, String> {
        let mut url = format!("{}/repos/{}/{}/issues", GITHUB_API_BASE, owner, repo);

        let mut query_params = vec![];
        if let Some(ref state) = params.state {
            query_params.push(format!("state={}", state.as_str()));
        }
        if let Some(ref labels) = params.labels {
            query_params.push(format!("labels={}", urlencoding::encode(labels)));
        }
        if let Some(ref milestone) = params.milestone {
            query_params.push(format!("milestone={}", milestone));
        }
        if let Some(ref assignee) = params.assignee {
            query_params.push(format!("assignee={}", assignee));
        }
        if let Some(ref sort) = params.sort {
            query_params.push(format!("sort={}", sort.as_str()));
        }
        if let Some(ref direction) = params.direction {
            query_params.push(format!("direction={}", direction.as_str()));
        }
        if let Some(per_page) = params.per_page {
            query_params.push(format!("per_page={}", per_page));
        }
        if let Some(page) = params.page {
            query_params.push(format!("page={}", page));
        }

        if !query_params.is_empty() {
            url = format!("{}?{}", url, query_params.join("&"));
        }

        self.get_request(&url).await
    }

    pub async fn get_issue(
        &self,
        owner: &str,
        repo: &str,
        issue_number: i32,
    ) -> Result<Issue, String> {
        let url = format!(
            "{}/repos/{}/{}/issues/{}",
            GITHUB_API_BASE, owner, repo, issue_number
        );
        self.get_request(&url).await
    }

    pub async fn list_labels(&self, owner: &str, repo: &str) -> Result<Vec<Label>, String> {
        let url = format!("{}/repos/{}/{}/labels", GITHUB_API_BASE, owner, repo);
        self.get_request(&url).await
    }

    pub async fn list_milestones(&self, owner: &str, repo: &str) -> Result<Vec<Milestone>, String> {
        let url = format!("{}/repos/{}/{}/milestones", GITHUB_API_BASE, owner, repo);
        self.get_request(&url).await
    }

    pub async fn create_pull_request(
        &self,
        owner: &str,
        repo: &str,
        request: &CreatePullRequestRequest,
    ) -> Result<PullRequest, String> {
        let url = format!("{}/repos/{}/{}/pulls", GITHUB_API_BASE, owner, repo);
        self.post_request(&url, request).await
    }
}

impl Default for GitHubClient {
    fn default() -> Self {
        Self::new()
    }
}

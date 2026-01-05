use reqwest::Client;

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
}

impl Default for GitHubClient {
    fn default() -> Self {
        Self::new()
    }
}

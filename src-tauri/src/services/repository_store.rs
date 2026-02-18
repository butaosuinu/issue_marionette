use crate::models::Repository;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

const STORE_PATH: &str = "repositories.json";
const REPOSITORIES_KEY: &str = "repositories";

pub struct RepositoryStore;

impl RepositoryStore {
    pub fn save(app: &AppHandle, repository: Repository) -> Result<(), String> {
        let store = app
            .store(STORE_PATH)
            .map_err(|e| format!("Failed to open store: {}", e))?;

        let mut repositories: Vec<Repository> = Self::load_all(app)?
            .into_iter()
            .filter(|r| r.id != repository.id)
            .collect();
        repositories.push(repository);

        store.set(
            REPOSITORIES_KEY,
            serde_json::to_value(&repositories)
                .map_err(|e| format!("Failed to serialize: {}", e))?,
        );

        store
            .save()
            .map_err(|e| format!("Failed to save store: {}", e))?;

        Ok(())
    }

    pub fn load_all(app: &AppHandle) -> Result<Vec<Repository>, String> {
        let store = app
            .store(STORE_PATH)
            .map_err(|e| format!("Failed to open store: {}", e))?;

        match store.get(REPOSITORIES_KEY) {
            Some(value) => {
                let repositories: Vec<Repository> = serde_json::from_value(value.clone())
                    .map_err(|e| format!("Failed to deserialize: {}", e))?;
                Ok(repositories)
            }
            None => Ok(vec![]),
        }
    }

    pub fn delete(app: &AppHandle, id: &str) -> Result<(), String> {
        let store = app
            .store(STORE_PATH)
            .map_err(|e| format!("Failed to open store: {}", e))?;

        let repositories: Vec<Repository> = Self::load_all(app)?
            .into_iter()
            .filter(|r| r.id != id)
            .collect();

        store.set(
            REPOSITORIES_KEY,
            serde_json::to_value(&repositories)
                .map_err(|e| format!("Failed to serialize: {}", e))?,
        );

        store
            .save()
            .map_err(|e| format!("Failed to save store: {}", e))?;

        Ok(())
    }
}

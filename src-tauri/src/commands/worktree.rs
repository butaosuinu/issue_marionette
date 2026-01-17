use crate::models::{Worktree, WorktreeStatus};
use crate::services::GitService;
use chrono::Utc;
use sha2::{Digest, Sha256};
use std::fs;
use std::path::Path;
use tauri::command;

#[command]
pub async fn create_worktree(
    repo_path: String,
    issue_number: i32,
    branch_name: String,
) -> Result<Worktree, String> {
    let repo_path = Path::new(&repo_path);

    if !repo_path.exists() {
        return Err(format!("Repository path does not exist: {:?}", repo_path));
    }

    let repo_name = repo_path
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or_else(|| "Invalid repository path".to_string())?;

    let worktrees_dir = repo_path
        .parent()
        .ok_or_else(|| "Cannot determine parent directory".to_string())?
        .join(format!("{}-worktrees", repo_name));

    if !worktrees_dir.exists() {
        fs::create_dir_all(&worktrees_dir)
            .map_err(|e| format!("Failed to create worktrees directory: {}", e))?;
    }

    let worktree_dir_name = format!(
        "issue-{}-{}",
        issue_number,
        sanitize_branch_name(&branch_name)
    );
    let worktree_path = worktrees_dir.join(&worktree_dir_name);

    if worktree_path.exists() {
        return Err(format!("Worktree already exists at {:?}", worktree_path));
    }

    let branch_exists = GitService::branch_exists(repo_path, &branch_name)?;

    if branch_exists {
        GitService::worktree_add_existing_branch(repo_path, &worktree_path, &branch_name)?;
    } else {
        GitService::worktree_add(repo_path, &worktree_path, &branch_name)?;
    }

    let worktree_path_str = worktree_path.to_string_lossy().to_string();
    let now = Utc::now().to_rfc3339();
    let worktree = Worktree {
        id: generate_worktree_id(&worktree_path_str),
        repository_id: repo_path.to_string_lossy().to_string(),
        issue_number: Some(issue_number),
        branch_name,
        path: worktree_path_str,
        status: WorktreeStatus::Ready,
        created_at: now.clone(),
        updated_at: now,
    };

    Ok(worktree)
}

#[command]
pub async fn list_worktrees(repo_path: String) -> Result<Vec<Worktree>, String> {
    let repo_path = Path::new(&repo_path);

    if !repo_path.exists() {
        return Err(format!("Repository path does not exist: {:?}", repo_path));
    }

    let worktree_infos = GitService::worktree_list_detailed(repo_path)?;

    let repo_name = repo_path.file_name().and_then(|n| n.to_str()).unwrap_or("");

    let worktrees_dir = repo_path
        .parent()
        .map(|p| p.join(format!("{}-worktrees", repo_name)));

    let now = Utc::now().to_rfc3339();

    let worktrees: Vec<Worktree> = worktree_infos
        .into_iter()
        .filter(|info| !info.is_bare)
        .filter(|info| {
            if let Some(ref dir) = worktrees_dir {
                Path::new(&info.path).starts_with(dir)
            } else {
                false
            }
        })
        .map(|info| {
            let issue_number = extract_issue_number(&info.path);
            Worktree {
                id: generate_worktree_id(&info.path),
                repository_id: repo_path.to_string_lossy().to_string(),
                issue_number,
                branch_name: info.branch.unwrap_or_default(),
                path: info.path,
                status: WorktreeStatus::Ready,
                created_at: now.clone(),
                updated_at: now.clone(),
            }
        })
        .collect();

    Ok(worktrees)
}

#[command]
pub async fn remove_worktree(worktree_path: String, force: bool) -> Result<(), String> {
    let worktree_path = Path::new(&worktree_path);

    if !worktree_path.exists() {
        return Err(format!("Worktree path does not exist: {:?}", worktree_path));
    }

    let repo_path = find_main_repo_from_worktree(worktree_path)?;

    GitService::worktree_remove(&repo_path, worktree_path, force)?;

    Ok(())
}

fn find_main_repo_from_worktree(worktree_path: &Path) -> Result<std::path::PathBuf, String> {
    let worktrees_dir = worktree_path
        .parent()
        .ok_or_else(|| "Cannot determine parent directory of worktree".to_string())?;

    let worktrees_dir_name = worktrees_dir
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or_else(|| "Invalid worktrees directory name".to_string())?;

    let repo_name = worktrees_dir_name
        .strip_suffix("-worktrees")
        .ok_or_else(|| {
            format!(
                "Worktrees directory does not follow expected naming convention: {}",
                worktrees_dir_name
            )
        })?;

    let parent_dir = worktrees_dir
        .parent()
        .ok_or_else(|| "Cannot determine parent directory of worktrees directory".to_string())?;

    let repo_path = parent_dir.join(repo_name);

    if !repo_path.exists() {
        return Err(format!("Main repository not found at {:?}", repo_path));
    }

    Ok(repo_path)
}

#[command]
pub async fn get_worktree_diff(worktree_path: String) -> Result<String, String> {
    let worktree_path = Path::new(&worktree_path);

    if !worktree_path.exists() {
        return Err(format!("Worktree path does not exist: {:?}", worktree_path));
    }

    let default_branch = GitService::get_default_branch(worktree_path)?;

    GitService::diff_with_base(worktree_path, &default_branch)
}

fn sanitize_branch_name(name: &str) -> String {
    name.chars()
        .map(|c| {
            if c.is_alphanumeric() || c == '-' || c == '_' {
                c
            } else {
                '-'
            }
        })
        .collect::<String>()
        .to_lowercase()
}

fn extract_issue_number(path: &str) -> Option<i32> {
    let path = Path::new(path);
    let dir_name = path.file_name()?.to_str()?;
    if dir_name.starts_with("issue-") {
        let parts: Vec<&str> = dir_name.splitn(3, '-').collect();
        if parts.len() >= 2 {
            return parts[1].parse::<i32>().ok();
        }
    }
    None
}

fn generate_worktree_id(path: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(path.as_bytes());
    let result = hasher.finalize();
    format!("{:x}", result)[..32].to_string()
}

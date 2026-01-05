use std::path::Path;
use std::process::Command;

pub struct GitService;

impl GitService {
    pub fn worktree_add(
        repo_path: &Path,
        worktree_path: &Path,
        branch_name: &str,
    ) -> Result<(), String> {
        let output = Command::new("git")
            .current_dir(repo_path)
            .args(["worktree", "add", "-b", branch_name])
            .arg(worktree_path)
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            Ok(())
        } else {
            Err(String::from_utf8_lossy(&output.stderr).to_string())
        }
    }

    pub fn worktree_list(repo_path: &Path) -> Result<Vec<String>, String> {
        let output = Command::new("git")
            .current_dir(repo_path)
            .args(["worktree", "list", "--porcelain"])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let worktrees: Vec<String> = stdout
                .lines()
                .filter(|line| line.starts_with("worktree "))
                .map(|line| line.trim_start_matches("worktree ").to_string())
                .collect();
            Ok(worktrees)
        } else {
            Err(String::from_utf8_lossy(&output.stderr).to_string())
        }
    }

    pub fn worktree_remove(worktree_path: &Path, force: bool) -> Result<(), String> {
        let mut args = vec!["worktree", "remove"];
        if force {
            args.push("--force");
        }

        let output = Command::new("git")
            .args(&args)
            .arg(worktree_path)
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            Ok(())
        } else {
            Err(String::from_utf8_lossy(&output.stderr).to_string())
        }
    }

    pub fn diff(repo_path: &Path) -> Result<String, String> {
        let output = Command::new("git")
            .current_dir(repo_path)
            .args(["diff", "HEAD"])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            Ok(String::from_utf8_lossy(&output.stdout).to_string())
        } else {
            Err(String::from_utf8_lossy(&output.stderr).to_string())
        }
    }
}

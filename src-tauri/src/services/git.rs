use std::path::Path;
use std::process::Command;

#[derive(Debug, Clone)]
pub struct WorktreeInfo {
    pub path: String,
    pub branch: Option<String>,
    pub head: String,
    pub is_bare: bool,
}

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

    pub fn worktree_remove(
        repo_path: &Path,
        worktree_path: &Path,
        force: bool,
    ) -> Result<(), String> {
        let mut args = vec!["worktree", "remove"];
        if force {
            args.push("--force");
        }

        let output = Command::new("git")
            .current_dir(repo_path)
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

    pub fn worktree_list_detailed(repo_path: &Path) -> Result<Vec<WorktreeInfo>, String> {
        let output = Command::new("git")
            .current_dir(repo_path)
            .args(["worktree", "list", "--porcelain"])
            .output()
            .map_err(|e| e.to_string())?;

        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        let mut worktrees = Vec::new();
        let mut current_path: Option<String> = None;
        let mut current_head: Option<String> = None;
        let mut current_branch: Option<String> = None;
        let mut is_bare = false;

        for line in stdout.lines() {
            if line.starts_with("worktree ") {
                if let Some(path) = current_path.take() {
                    worktrees.push(WorktreeInfo {
                        path,
                        branch: current_branch.take(),
                        head: current_head.take().unwrap_or_default(),
                        is_bare,
                    });
                    is_bare = false;
                }
                current_path = Some(line.trim_start_matches("worktree ").to_string());
            } else if let Some(head) = line.strip_prefix("HEAD ") {
                current_head = Some(head.to_string());
            } else if let Some(branch) = line.strip_prefix("branch refs/heads/") {
                current_branch = Some(branch.to_string());
            } else if line == "bare" {
                is_bare = true;
            }
        }

        if let Some(path) = current_path.take() {
            worktrees.push(WorktreeInfo {
                path,
                branch: current_branch.take(),
                head: current_head.take().unwrap_or_default(),
                is_bare,
            });
        }

        Ok(worktrees)
    }

    pub fn branch_exists(repo_path: &Path, branch_name: &str) -> Result<bool, String> {
        let output = Command::new("git")
            .current_dir(repo_path)
            .args([
                "rev-parse",
                "--verify",
                &format!("refs/heads/{}", branch_name),
            ])
            .output()
            .map_err(|e| e.to_string())?;

        Ok(output.status.success())
    }

    pub fn worktree_add_existing_branch(
        repo_path: &Path,
        worktree_path: &Path,
        branch_name: &str,
    ) -> Result<(), String> {
        let output = Command::new("git")
            .current_dir(repo_path)
            .args(["worktree", "add"])
            .arg(worktree_path)
            .arg(branch_name)
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            Ok(())
        } else {
            Err(String::from_utf8_lossy(&output.stderr).to_string())
        }
    }

    pub fn get_default_branch(repo_path: &Path) -> Result<String, String> {
        let output = Command::new("git")
            .current_dir(repo_path)
            .args(["symbolic-ref", "refs/remotes/origin/HEAD", "--short"])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            let branch = String::from_utf8_lossy(&output.stdout)
                .trim()
                .trim_start_matches("origin/")
                .to_string();
            return Ok(branch);
        }

        if Self::branch_exists(repo_path, "main")? {
            return Ok("main".to_string());
        }

        if Self::branch_exists(repo_path, "master")? {
            return Ok("master".to_string());
        }

        Err("Cannot determine default branch: neither 'main' nor 'master' exists".to_string())
    }

    pub fn diff_with_base(worktree_path: &Path, base_branch: &str) -> Result<String, String> {
        let merge_base_output = Command::new("git")
            .current_dir(worktree_path)
            .args(["merge-base", base_branch, "HEAD"])
            .output()
            .map_err(|e| e.to_string())?;

        let base_commit = if merge_base_output.status.success() {
            String::from_utf8_lossy(&merge_base_output.stdout)
                .trim()
                .to_string()
        } else {
            base_branch.to_string()
        };

        let output = Command::new("git")
            .current_dir(worktree_path)
            .args(["diff", &base_commit])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            Ok(String::from_utf8_lossy(&output.stdout).to_string())
        } else {
            Err(String::from_utf8_lossy(&output.stderr).to_string())
        }
    }
}

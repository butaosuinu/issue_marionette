pub mod commands;
pub mod models;
pub mod services;

use commands::{
    close_pty, create_pty_session, create_worktree, delete_repository, exchange_oauth_code,
    get_agent_status, get_authenticated_user, get_worktree_diff, list_worktrees,
    load_repositories, remove_worktree, resize_pty, save_repository, send_agent_input,
    start_agent, start_oauth_flow, stop_agent, write_pty,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            // GitHub
            start_oauth_flow,
            exchange_oauth_code,
            get_authenticated_user,
            // Worktree
            create_worktree,
            list_worktrees,
            remove_worktree,
            get_worktree_diff,
            // Agent
            start_agent,
            stop_agent,
            send_agent_input,
            get_agent_status,
            // Shell
            create_pty_session,
            write_pty,
            resize_pty,
            close_pty,
            // Storage
            save_repository,
            load_repositories,
            delete_repository,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

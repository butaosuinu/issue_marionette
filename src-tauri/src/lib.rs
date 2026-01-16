pub mod commands;
pub mod models;
pub mod services;

use commands::{
    close_pty, create_pty_session, create_worktree, delete_repository, exchange_oauth_code,
    get_agent_status, get_authenticated_user, get_stored_token, get_worktree_diff, list_worktrees,
    load_repositories, logout, remove_worktree, resize_pty, save_repository, send_agent_input,
    start_agent, start_oauth_flow, stop_agent, write_pty,
};
use services::PtyManager;
use std::sync::{Arc, Mutex};
use tauri::Emitter;
use tauri_plugin_deep_link::DeepLinkExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(Arc::new(Mutex::new(PtyManager::new())))
        .setup(|app| {
            #[cfg(desktop)]
            {
                let handle = app.handle().clone();
                app.deep_link().on_open_url(move |event| {
                    for url in event.urls() {
                        if let Err(e) = handle.emit("oauth-callback", url.to_string()) {
                            eprintln!("Failed to emit oauth-callback event: {}", e);
                        }
                    }
                });
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // GitHub
            start_oauth_flow,
            exchange_oauth_code,
            get_authenticated_user,
            logout,
            get_stored_token,
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

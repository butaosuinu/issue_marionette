use crate::models::{AgentMode, AgentOutputEvent, AgentSession, AgentStatus, AgentStatusEvent};
use chrono::Utc;
use portable_pty::{native_pty_system, Child, CommandBuilder, PtySize};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::mpsc::{self, Sender};
use tauri::{AppHandle, Emitter};
use uuid::Uuid;

const AGENT_READ_BUFFER_SIZE: usize = 4096;

pub enum AgentCommand {
    Write(Vec<u8>),
    Resize(u16, u16),
    Close,
}

pub struct AgentSessionInfo {
    pub session: AgentSession,
    pub command_tx: Sender<AgentCommand>,
    pub child: Box<dyn Child + Send>,
}

pub struct AgentManager {
    sessions: HashMap<String, AgentSessionInfo>,
}

impl AgentManager {
    pub fn new() -> Self {
        Self {
            sessions: HashMap::new(),
        }
    }

    pub fn create_session(
        &mut self,
        app_handle: AppHandle,
        worktree_path: String,
        issue_context: String,
        mode: AgentMode,
        cols: u16,
        rows: u16,
    ) -> Result<AgentSession, String> {
        let session_id = Uuid::new_v4().to_string();
        let pty_system = native_pty_system();

        let size = PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        };

        let pair = pty_system
            .openpty(size)
            .map_err(|e| format!("Failed to open PTY: {}", e))?;

        let cmd = build_claude_command(&worktree_path, &mode);

        let child = pair
            .slave
            .spawn_command(cmd)
            .map_err(|e| format!("Failed to spawn claude command: {}", e))?;

        let reader = pair
            .master
            .try_clone_reader()
            .map_err(|e| format!("Failed to clone reader: {}", e))?;

        let writer = pair
            .master
            .take_writer()
            .map_err(|e| format!("Failed to take writer: {}", e))?;

        let (command_tx, command_rx) = mpsc::channel::<AgentCommand>();

        let mut session = AgentSession {
            id: session_id.clone(),
            worktree_id: worktree_path.clone(),
            mode,
            status: AgentStatus::Starting,
            started_at: Utc::now().to_rfc3339(),
            completed_at: None,
        };

        spawn_output_reader(app_handle.clone(), session_id.clone(), reader);
        spawn_command_handler(pair.master, writer, command_rx);

        session.status = AgentStatus::Running;

        let session_info = AgentSessionInfo {
            session: session.clone(),
            command_tx: command_tx.clone(),
            child,
        };

        self.sessions.insert(session_id.clone(), session_info);

        emit_status_change(&app_handle, &session_id, AgentStatus::Running);

        if !issue_context.is_empty() {
            let context_with_newline = format!("{}\n", issue_context);
            if let Err(e) = command_tx.send(AgentCommand::Write(context_with_newline.into_bytes()))
            {
                self.sessions.remove(&session_id);
                return Err(format!("Failed to send issue context: {}", e));
            }
        }

        Ok(session)
    }

    pub fn write(&self, session_id: &str, data: &[u8]) -> Result<(), String> {
        let session_info = self
            .sessions
            .get(session_id)
            .ok_or_else(|| format!("Session not found: {}", session_id))?;

        session_info
            .command_tx
            .send(AgentCommand::Write(data.to_vec()))
            .map_err(|e| format!("Failed to send write command: {}", e))?;

        Ok(())
    }

    pub fn resize(&self, session_id: &str, cols: u16, rows: u16) -> Result<(), String> {
        let session_info = self
            .sessions
            .get(session_id)
            .ok_or_else(|| format!("Session not found: {}", session_id))?;

        session_info
            .command_tx
            .send(AgentCommand::Resize(cols, rows))
            .map_err(|e| format!("Failed to send resize command: {}", e))?;

        Ok(())
    }

    pub fn close(&mut self, session_id: &str) -> Result<(), String> {
        let mut session_info = self
            .sessions
            .remove(session_id)
            .ok_or_else(|| format!("Session not found: {}", session_id))?;

        let _ = session_info.command_tx.send(AgentCommand::Close);

        if let Err(e) = session_info.child.kill() {
            eprintln!(
                "Failed to kill child process for session {}: {}",
                session_id, e
            );
        }

        Ok(())
    }

    #[allow(dead_code)]
    pub fn get_session(&self, session_id: &str) -> Option<&AgentSessionInfo> {
        self.sessions.get(session_id)
    }

    pub fn get_status(&self, session_id: &str) -> Option<AgentStatus> {
        self.sessions
            .get(session_id)
            .map(|info| info.session.status.clone())
    }
}

impl Default for AgentManager {
    fn default() -> Self {
        Self::new()
    }
}

fn build_claude_command(worktree_path: &str, mode: &AgentMode) -> CommandBuilder {
    let mut cmd = CommandBuilder::new("claude");
    cmd.cwd(worktree_path);

    match mode {
        AgentMode::Plan => {
            cmd.arg("--plan");
        }
        AgentMode::Act => {}
    }

    cmd
}

fn emit_status_change(app_handle: &AppHandle, session_id: &str, status: AgentStatus) {
    let event = AgentStatusEvent {
        session_id: session_id.to_string(),
        status,
    };
    if let Err(e) = app_handle.emit("agent-status-changed", event) {
        eprintln!("Failed to emit agent-status-changed event: {}", e);
    }
}

fn spawn_output_reader(
    app_handle: AppHandle,
    session_id: String,
    mut reader: Box<dyn Read + Send>,
) {
    std::thread::spawn(move || {
        let mut buffer = [0u8; AGENT_READ_BUFFER_SIZE];
        loop {
            match reader.read(&mut buffer) {
                Ok(0) => {
                    emit_status_change(&app_handle, &session_id, AgentStatus::Completed);
                    break;
                }
                Ok(n) => {
                    let payload = AgentOutputEvent {
                        session_id: session_id.clone(),
                        data: buffer[..n].to_vec(),
                    };
                    if let Err(e) = app_handle.emit("agent-output", payload) {
                        eprintln!("Failed to emit agent-output event: {}", e);
                        emit_status_change(&app_handle, &session_id, AgentStatus::Error);
                        break;
                    }
                }
                Err(e) => {
                    eprintln!("Agent read error for session {}: {}", session_id, e);
                    emit_status_change(&app_handle, &session_id, AgentStatus::Error);
                    break;
                }
            }
        }
    });
}

fn spawn_command_handler(
    master: Box<dyn portable_pty::MasterPty + Send>,
    mut writer: Box<dyn Write + Send>,
    command_rx: mpsc::Receiver<AgentCommand>,
) {
    std::thread::spawn(move || {
        while let Ok(command) = command_rx.recv() {
            match command {
                AgentCommand::Write(data) => {
                    if writer.write_all(&data).is_err() {
                        break;
                    }
                    if writer.flush().is_err() {
                        break;
                    }
                }
                AgentCommand::Resize(cols, rows) => {
                    let size = PtySize {
                        rows,
                        cols,
                        pixel_width: 0,
                        pixel_height: 0,
                    };
                    if master.resize(size).is_err() {
                        break;
                    }
                }
                AgentCommand::Close => {
                    break;
                }
            }
        }
    });
}

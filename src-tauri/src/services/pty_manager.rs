use crate::models::PtyOutputEvent;
use portable_pty::{native_pty_system, Child, CommandBuilder, PtySize};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::mpsc::{self, Sender};
use tauri::{AppHandle, Emitter};
use uuid::Uuid;

const PTY_READ_BUFFER_SIZE: usize = 4096;

pub enum PtyCommand {
    Write(Vec<u8>),
    Resize(u16, u16),
    Close,
}

pub struct PtySession {
    pub id: String,
    pub command_tx: Sender<PtyCommand>,
    pub child: Box<dyn Child + Send>,
}

pub struct PtyManager {
    sessions: HashMap<String, PtySession>,
}

impl PtyManager {
    pub fn new() -> Self {
        Self {
            sessions: HashMap::new(),
        }
    }

    pub fn create_session(
        &mut self,
        app_handle: AppHandle,
        working_dir: String,
        cols: u16,
        rows: u16,
    ) -> Result<String, String> {
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

        let cmd = get_default_shell(&working_dir);

        let child = pair
            .slave
            .spawn_command(cmd)
            .map_err(|e| format!("Failed to spawn command: {}", e))?;

        let reader = pair
            .master
            .try_clone_reader()
            .map_err(|e| format!("Failed to clone reader: {}", e))?;

        let writer = pair
            .master
            .take_writer()
            .map_err(|e| format!("Failed to take writer: {}", e))?;

        let (command_tx, command_rx) = mpsc::channel::<PtyCommand>();

        spawn_output_reader(app_handle, session_id.clone(), reader);
        spawn_command_handler(pair.master, writer, command_rx);

        let session = PtySession {
            id: session_id.clone(),
            command_tx,
            child,
        };

        self.sessions.insert(session_id.clone(), session);

        Ok(session_id)
    }

    pub fn write(&self, session_id: &str, data: &[u8]) -> Result<(), String> {
        let session = self
            .sessions
            .get(session_id)
            .ok_or_else(|| format!("Session not found: {}", session_id))?;

        session
            .command_tx
            .send(PtyCommand::Write(data.to_vec()))
            .map_err(|e| format!("Failed to send write command: {}", e))?;

        Ok(())
    }

    pub fn resize(&self, session_id: &str, cols: u16, rows: u16) -> Result<(), String> {
        let session = self
            .sessions
            .get(session_id)
            .ok_or_else(|| format!("Session not found: {}", session_id))?;

        session
            .command_tx
            .send(PtyCommand::Resize(cols, rows))
            .map_err(|e| format!("Failed to send resize command: {}", e))?;

        Ok(())
    }

    pub fn close(&mut self, session_id: &str) -> Result<(), String> {
        let mut session = self
            .sessions
            .remove(session_id)
            .ok_or_else(|| format!("Session not found: {}", session_id))?;

        let _ = session.command_tx.send(PtyCommand::Close);

        if let Err(e) = session.child.kill() {
            eprintln!("Failed to kill child process for session {}: {}", session_id, e);
        }

        Ok(())
    }
}

impl Default for PtyManager {
    fn default() -> Self {
        Self::new()
    }
}

fn get_default_shell(working_dir: &str) -> CommandBuilder {
    #[cfg(target_os = "windows")]
    {
        let mut cmd = CommandBuilder::new("cmd.exe");
        cmd.cwd(working_dir);
        cmd
    }
    #[cfg(not(target_os = "windows"))]
    {
        let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string());
        let mut cmd = CommandBuilder::new(shell);
        cmd.cwd(working_dir);
        cmd
    }
}

fn spawn_output_reader(
    app_handle: AppHandle,
    session_id: String,
    mut reader: Box<dyn Read + Send>,
) {
    std::thread::spawn(move || {
        let mut buffer = [0u8; PTY_READ_BUFFER_SIZE];
        loop {
            match reader.read(&mut buffer) {
                Ok(0) => break,
                Ok(n) => {
                    let payload = PtyOutputEvent {
                        session_id: session_id.clone(),
                        data: buffer[..n].to_vec(),
                    };
                    if let Err(e) = app_handle.emit("pty-output", payload) {
                        eprintln!("Failed to emit pty-output event: {}", e);
                        break;
                    }
                }
                Err(e) => {
                    eprintln!("PTY read error for session {}: {}", session_id, e);
                    break;
                }
            }
        }
    });
}

fn spawn_command_handler(
    master: Box<dyn portable_pty::MasterPty + Send>,
    mut writer: Box<dyn Write + Send>,
    command_rx: mpsc::Receiver<PtyCommand>,
) {
    std::thread::spawn(move || {
        while let Ok(command) = command_rx.recv() {
            match command {
                PtyCommand::Write(data) => {
                    if writer.write_all(&data).is_err() {
                        break;
                    }
                    if writer.flush().is_err() {
                        break;
                    }
                }
                PtyCommand::Resize(cols, rows) => {
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
                PtyCommand::Close => {
                    break;
                }
            }
        }
    });
}

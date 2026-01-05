use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct ProcessManager {
    processes: Arc<RwLock<HashMap<String, ProcessInfo>>>,
}

pub struct ProcessInfo {
    pub id: String,
    pub pid: u32,
    pub status: ProcessStatus,
}

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum ProcessStatus {
    Running,
    Stopped,
    Completed,
    Error,
}

impl ProcessManager {
    pub fn new() -> Self {
        Self {
            processes: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn register(&self, id: String, pid: u32) {
        let mut processes = self.processes.write().await;
        processes.insert(
            id.clone(),
            ProcessInfo {
                id,
                pid,
                status: ProcessStatus::Running,
            },
        );
    }

    pub async fn get_status(&self, id: &str) -> Option<ProcessStatus> {
        let processes = self.processes.read().await;
        processes.get(id).map(|p| p.status)
    }

    pub async fn set_status(&self, id: &str, status: ProcessStatus) {
        let mut processes = self.processes.write().await;
        if let Some(process) = processes.get_mut(id) {
            process.status = status;
        }
    }

    pub async fn remove(&self, id: &str) {
        let mut processes = self.processes.write().await;
        processes.remove(id);
    }
}

impl Default for ProcessManager {
    fn default() -> Self {
        Self::new()
    }
}

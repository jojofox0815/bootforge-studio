pub mod process;
pub mod usb_safety;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum JobState {
    Queued,
    Running,
    Paused,
    Failed,
    Cancelled,
    Succeeded,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolInvocation {
    pub executable: String,
    pub args: Vec<String>,
    pub working_directory: Option<String>,
}

impl ToolInvocation {
    pub fn validate(&self) -> Result<(), &'static str> {
        if self.executable.trim().is_empty() { return Err("executable is required"); }
        if self.args.iter().any(|arg| arg.contains('\0')) { return Err("arguments may not contain NUL"); }
        Ok(())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("BootForge Studio failed to start");
}

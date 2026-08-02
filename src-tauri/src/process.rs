use std::process::{Command, Stdio};
use crate::ToolInvocation;

pub fn build_command(invocation: &ToolInvocation) -> Result<Command, &'static str> {
    invocation.validate()?;
    let mut command = Command::new(&invocation.executable);
    command.args(&invocation.args).stdin(Stdio::null()).stdout(Stdio::piped()).stderr(Stdio::piped());
    if let Some(directory) = &invocation.working_directory { command.current_dir(directory); }
    Ok(command)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn rejects_nul_arguments() {
        let invocation = ToolInvocation { executable: "qemu-system-x86_64".into(), args: vec!["bad\0arg".into()], working_directory: None };
        assert!(build_command(&invocation).is_err());
    }
}

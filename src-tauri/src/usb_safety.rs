use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceIdentity { pub id: String, pub model: String, pub serial: String, pub removable: bool, pub system_disk: bool }

pub fn validate_target(device: &DeviceIdentity) -> Result<String, Vec<&'static str>> {
    let mut reasons = Vec::new();
    if device.system_disk { reasons.push("system disk is blocked"); }
    if !device.removable { reasons.push("non-removable device is blocked"); }
    if device.serial.trim().is_empty() { reasons.push("device serial is required"); }
    if reasons.is_empty() { Ok(format!("LÖSCHEN {}", device.model.to_uppercase())) } else { Err(reasons) }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn blocks_system_disk() {
        let device = DeviceIdentity { id: "disk0".into(), model: "System".into(), serial: "abc".into(), removable: false, system_disk: true };
        assert!(validate_target(&device).is_err());
    }
}

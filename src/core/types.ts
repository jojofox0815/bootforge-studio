export type OsFamily = "windows" | "ubuntu" | "debian" | "fedora" | "arch" | "unknown";
export type Confidence = "high" | "medium" | "low";
export type OutputMode = "dynamic" | "multiboot" | "custom-iso";

export interface IsoImage {
  id: string;
  name: string;
  path: string;
  size: number;
  sha256: string;
  family: OsFamily;
  product: string;
  version: string;
  architecture: "amd64" | "arm64" | "x86" | "unknown";
  editions: string[];
  bootModes: Array<"uefi" | "bios">;
  confidence: Confidence;
  capabilities: string[];
  status: "ready" | "analyzing" | "warning";
}

export interface UserAccount {
  username: string;
  displayName: string;
  role: "administrator" | "standard";
  accountType: "local" | "microsoft" | "domain";
  passwordMode: "prompt_at_install" | "temporary" | "vault" | "none";
  passwordChangeRequired: boolean;
}

export interface SoftwarePackage {
  source: "winget" | "apt" | "custom";
  id: string;
  version?: string;
}

export interface InstallProfile {
  schemaVersion: 1;
  id: string;
  name: string;
  description: string;
  imageId: string;
  family: OsFamily;
  outputMode: OutputMode;
  identity: { hostname: string; timezone: string; locale: string; keyboard: string };
  users: UserAccount[];
  storage: { mode: "guided" | "manual"; partitionTable: "gpt" | "mbr"; preserveDataPartitions: boolean; encryption: "none" | "bitlocker" | "luks" };
  network: { mode: "dhcp" | "static"; offline: boolean };
  software: SoftwarePackage[];
  scripts: { preInstall: string[]; postInstall: string[] };
  compatibility: { bypassTpm: boolean; bypassSecureBoot: boolean; bypassRam: boolean };
  updatedAt: string;
}

export interface ValidationIssue {
  id: string;
  level: "error" | "warning" | "info";
  title: string;
  message: string;
  field?: string;
}

export interface UsbDevice {
  id: string;
  vendor: string;
  model: string;
  serial: string;
  size: number;
  removable: boolean;
  systemDisk: boolean;
  mounted: boolean;
}

export interface JobLog {
  id: string;
  type: "iso-analysis" | "profile-export" | "usb-build" | "vm-test";
  status: "running" | "success" | "warning" | "failed";
  startedAt: string;
  endedAt?: string;
  progress: number;
  summary: string;
  steps: Array<{ at: string; level: "info" | "warning" | "error"; message: string }>;
}

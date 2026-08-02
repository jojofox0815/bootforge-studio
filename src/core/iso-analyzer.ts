import type { Confidence, IsoImage, OsFamily } from "./types";

export interface IsoProbe { name: string; size: number; entries: string[]; metadata?: Record<string, string> }

const has = (entries: string[], pattern: string) => entries.some((entry) => entry.toLowerCase().includes(pattern.toLowerCase()));

export function detectIso(probe: IsoProbe): Pick<IsoImage, "family" | "product" | "version" | "architecture" | "editions" | "bootModes" | "confidence" | "capabilities"> {
  const entries = probe.entries.map((entry) => entry.replaceAll("\\", "/"));
  let family: OsFamily = "unknown";
  let product = "Generisches bootfähiges Image";
  let confidence: Confidence = "low";
  let capabilities: string[] = [];

  if (has(entries, "sources/install.wim") || has(entries, "sources/install.esd")) {
    family = "windows"; product = probe.metadata?.product ?? "Windows 11"; confidence = "high";
    capabilities = ["Unbeaufsichtigte Installation", "Lokale Benutzer", "OOBE-Konfiguration", "DISM-Servicing"];
  } else if (has(entries, "casper/") && has(entries, ".disk/info")) {
    family = "ubuntu"; product = probe.metadata?.product ?? "Ubuntu"; confidence = "high";
    capabilities = ["Autoinstall", "Cloud-init", "Curtin", "Paketinstallation"];
  } else if (has(entries, "install.amd/") || has(entries, "preseed.cfg")) {
    family = "debian"; product = "Debian"; confidence = "medium"; capabilities = ["Preseed", "Tasksel"];
  } else if (has(entries, ".treeinfo") && has(entries, "images/")) {
    family = "fedora"; product = probe.metadata?.product ?? "Fedora"; confidence = "medium"; capabilities = ["Kickstart", "%pre / %post"];
  } else if (has(entries, "arch/")) {
    family = "arch"; product = "Arch Linux"; confidence = "medium"; capabilities = ["archinstall", "Shell-Skripte"];
  }

  return {
    family, product, version: probe.metadata?.version ?? "Unbekannt",
    architecture: probe.metadata?.architecture === "arm64" ? "arm64" : probe.metadata?.architecture === "x86" ? "x86" : "amd64",
    editions: probe.metadata?.editions?.split("|") ?? [],
    bootModes: has(entries, "efi/") ? ["uefi", "bios"] : ["bios"], confidence, capabilities,
  };
}

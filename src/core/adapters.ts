import type { InstallProfile } from "./types";

export interface GeneratedArtifact { path: string; content: string; mediaType: string }
export interface OsAdapter { id: string; supports(profile: InstallProfile): boolean; generate(profile: InstallProfile): GeneratedArtifact[] }
const xml = (value: string) => value.replace(/[<>&'\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '\"': "&quot;" })[char]!);

export const windowsAdapter: OsAdapter = {
  id: "windows-unattend-v1",
  supports: (profile) => profile.family === "windows",
  generate(profile) {
    const user = profile.users[0];
    const artifact = `<?xml version="1.0" encoding="utf-8"?>\n<unattend xmlns="urn:schemas-microsoft-com:unattend">\n  <settings pass="specialize">\n    <component name="Microsoft-Windows-Shell-Setup" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">\n      <ComputerName>${xml(profile.identity.hostname)}</ComputerName>\n      <TimeZone>${xml(profile.identity.timezone)}</TimeZone>\n    </component>\n  </settings>\n  <settings pass="oobeSystem">\n    <component name="Microsoft-Windows-International-Core" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">\n      <InputLocale>${xml(profile.identity.keyboard)}</InputLocale><SystemLocale>${xml(profile.identity.locale)}</SystemLocale><UILanguage>${xml(profile.identity.locale)}</UILanguage>\n    </component>\n    ${user ? `<component name="Microsoft-Windows-Shell-Setup" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS"><UserAccounts><LocalAccounts><LocalAccount wcm:action="add" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State"><Name>${xml(user.username)}</Name><DisplayName>${xml(user.displayName)}</DisplayName><Group>${user.role === "administrator" ? "Administrators" : "Users"}</Group></LocalAccount></LocalAccounts></UserAccounts></component>` : ""}\n  </settings>\n</unattend>`;
    return [{ path: "autounattend.xml", content: artifact, mediaType: "application/xml" }, { path: "scripts/SetupComplete.ps1", content: profile.scripts.postInstall.map((script) => `& \"$PSScriptRoot/${script}\"`).join("\n"), mediaType: "text/x-powershell" }];
  },
};

export const ubuntuAdapter: OsAdapter = {
  id: "ubuntu-autoinstall-v1",
  supports: (profile) => profile.family === "ubuntu",
  generate(profile) {
    const user = profile.users[0];
    const packages = profile.software.map((item) => `      - ${item.id}`).join("\n");
    return [{ path: "nocloud/user-data", mediaType: "application/yaml", content: `#cloud-config\nautoinstall:\n  version: 1\n  locale: ${profile.identity.locale}\n  keyboard:\n    layout: ${profile.identity.keyboard}\n  identity:\n    hostname: ${profile.identity.hostname}\n    username: ${user?.username ?? "installer"}\n    password: \"$6$PROMPT_OR_VAULT\"\n  packages:\n${packages || "      []"}\n  late-commands:\n${profile.scripts.postInstall.map((script) => `    - curtin in-target -- /bin/sh /opt/bootforge/${script}`).join("\n") || "    []"}\n` }, { path: "nocloud/meta-data", mediaType: "text/plain", content: `instance-id: ${profile.id}\nlocal-hostname: ${profile.identity.hostname}\n` }];
  },
};

export const adapters: OsAdapter[] = [windowsAdapter, ubuntuAdapter];

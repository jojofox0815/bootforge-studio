import { describe, expect, it } from "vitest";
import { windowsAdapter, ubuntuAdapter } from "../../src/core/adapters";
import { detectIso } from "../../src/core/iso-analyzer";
import { isValidHostname, isValidUsername, migrateProfile, profileSchema } from "../../src/core/profile-schema";
import { evaluateUsbTarget } from "../../src/core/usb-safety";
import { validateBuild } from "../../src/core/validation";
import { maskSecrets } from "../../src/core/security";
import { resolvePackageOrder } from "../../src/core/packages";
import { isSafeRelativePath } from "../../src/core/paths";
import { resumeJob, transitionJob } from "../../src/core/jobs";
import { applicableRules } from "../../src/core/compatibility";
import { pluginManifestSchema } from "../../src/core/plugins";
import { exampleDevices, exampleImages, exampleProfiles } from "../../src/data/examples";

describe("ISO detection", () => {
  it("detects Windows", () => expect(detectIso({ name: "win.iso", size: 1, entries: ["sources/install.wim", "sources/boot.wim", "efi/boot/bootx64.efi"] }).family).toBe("windows"));
  it("detects Ubuntu", () => expect(detectIso({ name: "ubuntu.iso", size: 1, entries: [".disk/info", "casper/vmlinuz", "efi/boot/bootx64.efi"] }).family).toBe("ubuntu"));
  it("keeps unknown images conservative", () => expect(detectIso({ name: "tool.iso", size: 1, entries: ["boot/kernel"] }).confidence).toBe("low"));
});

describe("profiles", () => {
  it("validates the v1 example", () => expect(profileSchema.safeParse(exampleProfiles[0]).success).toBe(true));
  it("migrates legacy output mode", () => expect(migrateProfile({ id: "x" })).toMatchObject({ schemaVersion: 1, outputMode: "dynamic" }));
  it("validates usernames", () => { expect(isValidUsername("developer")).toBe(true); expect(isValidUsername("bad user")).toBe(false); });
  it("validates hostnames", () => { expect(isValidHostname("dev-pc")).toBe(true); expect(isValidHostname("-bad")).toBe(false); });
});

describe("adapters", () => {
  it("generates escaped autounattend XML", () => expect(windowsAdapter.generate(exampleProfiles[0])[0].content).toContain("<ComputerName>dev-pc</ComputerName>"));
  it("generates Ubuntu autoinstall YAML", () => expect(ubuntuAdapter.generate(exampleProfiles[1])[0].content).toContain("autoinstall:"));
});

describe("safety", () => {
  it("blocks the system disk", () => expect(evaluateUsbTarget(exampleDevices[1]).allowed).toBe(false));
  it("warns for destructive guided storage", () => expect(validateBuild(exampleProfiles[0], exampleImages[0]).some((issue) => issue.id === "storage-destructive")).toBe(true));
});

describe("security and orchestration", () => {
  it("masks secrets recursively", () => expect(maskSecrets({ username: "dev", password: "plain", nested: { apiToken: "abc" } })).toEqual({ username: "dev", password: "***", nested: { apiToken: "***" } }));
  it("orders package dependencies", () => expect(resolvePackageOrder([{ id: "app", dependencies: ["runtime"] }, { id: "runtime", dependencies: [] }])).toEqual(["runtime", "app"]));
  it("rejects path traversal and absolute paths", () => { expect(isSafeRelativePath("scripts/setup.ps1")).toBe(true); expect(isSafeRelativePath("../secret")).toBe(false); expect(isSafeRelativePath("C:\\Windows")).toBe(false); });
  it("cancels running builds only through a valid state transition", () => expect(transitionJob({ id: "1", state: "running", completedSteps: [] }, "cancelled").state).toBe("cancelled"));
  it("resumes failed jobs only at a declared boundary", () => expect(resumeJob({ id: "1", state: "failed", completedSteps: ["hash"], resumableFrom: "generate" }).state).toBe("running"));
  it("ignores unsigned compatibility rules", () => expect(applicableRules([{ id: "old", family: "windows", signed: false, action: "registry" }, { id: "safe", family: "windows", signed: true, maxVersion: 26200, action: "warn" }], "windows", 26200).map((rule) => rule.id)).toEqual(["safe"]));
  it("validates signed plugin manifests", () => expect(pluginManifestSchema.safeParse({ id: "studio.example", version: "1.0.0", apiVersion: 1, entrypoint: "plugin.wasm", permissions: ["filesystem:read"], compatibility: { minAppVersion: "0.1.0" }, signature: { algorithm: "ed25519", value: "a".repeat(64) } }).success).toBe(true));
});

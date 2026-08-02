import { z } from "zod";

const hostname = z.string().min(1).max(63).regex(/^(?!-)[a-zA-Z0-9-]+(?<!-)$/, "Ungültiger Hostname");
const username = z.string().min(1).max(32).regex(/^[a-z_][a-z0-9_-]*$/i, "Ungültiger Benutzername");

export const profileSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  name: z.string().min(2).max(80),
  description: z.string().max(500),
  imageId: z.string().min(1),
  family: z.enum(["windows", "ubuntu", "debian", "fedora", "arch", "unknown"]),
  outputMode: z.enum(["dynamic", "multiboot", "custom-iso"]),
  identity: z.object({ hostname, timezone: z.string().min(1), locale: z.string().min(2), keyboard: z.string().min(2) }),
  users: z.array(z.object({
    username,
    displayName: z.string().min(1),
    role: z.enum(["administrator", "standard"]),
    accountType: z.enum(["local", "microsoft", "domain"]),
    passwordMode: z.enum(["prompt_at_install", "temporary", "vault", "none"]),
    passwordChangeRequired: z.boolean(),
  })).max(20),
  storage: z.object({
    mode: z.enum(["guided", "manual"]),
    partitionTable: z.enum(["gpt", "mbr"]),
    preserveDataPartitions: z.boolean(),
    encryption: z.enum(["none", "bitlocker", "luks"]),
  }),
  network: z.object({ mode: z.enum(["dhcp", "static"]), offline: z.boolean() }),
  software: z.array(z.object({ source: z.enum(["winget", "apt", "custom"]), id: z.string().min(1), version: z.string().optional() })),
  scripts: z.object({ preInstall: z.array(z.string()), postInstall: z.array(z.string()) }),
  compatibility: z.object({ bypassTpm: z.boolean(), bypassSecureBoot: z.boolean(), bypassRam: z.boolean() }),
  updatedAt: z.string().datetime(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export const isValidHostname = (value: string) => hostname.safeParse(value).success;
export const isValidUsername = (value: string) => username.safeParse(value).success;

export function migrateProfile(input: unknown): unknown {
  if (!input || typeof input !== "object") return input;
  const legacy = input as Record<string, unknown>;
  if (legacy.schemaVersion === 1) return input;
  return { ...legacy, schemaVersion: 1, outputMode: legacy.outputMode ?? "dynamic" };
}

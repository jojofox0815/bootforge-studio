import { z } from "zod";

export const pluginManifestSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9.-]+$/),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  apiVersion: z.literal(1),
  entrypoint: z.string().min(1),
  permissions: z.array(z.enum(["filesystem:read", "filesystem:write", "process:spawn", "network"])),
  compatibility: z.object({ minAppVersion: z.string() }),
  signature: z.object({ algorithm: z.literal("ed25519"), value: z.string().min(32) }),
});

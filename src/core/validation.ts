import { profileSchema } from "./profile-schema";
import type { InstallProfile, IsoImage, UsbDevice, ValidationIssue } from "./types";

export function validateBuild(profile: InstallProfile, image?: IsoImage, target?: UsbDevice): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const parsed = profileSchema.safeParse(profile);
  if (!parsed.success) issues.push({ id: "profile-schema", level: "error", title: "Profil ist ungültig", message: parsed.error.issues[0]?.message ?? "Schemafehler" });
  if (!image) issues.push({ id: "image-missing", level: "error", title: "ISO fehlt", message: "Die zugewiesene ISO ist nicht verfügbar." });
  else if (image.family !== profile.family) issues.push({ id: "family-mismatch", level: "error", title: "Inkompatibles Profil", message: `Profil ${profile.family} kann nicht auf ${image.family} angewendet werden.` });
  if (profile.storage.mode === "guided" && !profile.storage.preserveDataPartitions) issues.push({ id: "storage-destructive", level: "warning", title: "Datenträger wird neu partitioniert", message: "Alle Partitionen auf dem Installationsziel können gelöscht werden.", field: "storage" });
  if (profile.users.some((user) => user.passwordMode === "none")) issues.push({ id: "password-none", level: "warning", title: "Konto ohne Kennwort", message: "Mindestens ein Konto wird ohne Kennwort angelegt.", field: "users" });
  if (Object.values(profile.compatibility).some(Boolean)) issues.push({ id: "unsupported-windows", level: "warning", title: "Nicht unterstützte Hardwareoptionen", message: "Updates, Stabilität oder Support können beeinträchtigt sein.", field: "compatibility" });
  if (target?.systemDisk || (target && !target.removable)) issues.push({ id: "unsafe-target", level: "error", title: "Unsicheres Zielgerät", message: "Interne Datenträger und Systemlaufwerke sind gesperrt." });
  if (profile.outputMode === "dynamic") issues.push({ id: "dynamic-recommended", level: "info", title: "Original-ISO bleibt unverändert", message: "Antwortdateien und Skripte werden dynamisch bereitgestellt." });
  return issues;
}

export const canStartBuild = (issues: ValidationIssue[]) => !issues.some((issue) => issue.level === "error");

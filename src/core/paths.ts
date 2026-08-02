export function isSafeRelativePath(path: string): boolean {
  if (!path || path.includes("\0") || path.startsWith("/") || /^[a-z]:/i.test(path)) return false;
  const parts = path.replaceAll("\\", "/").split("/");
  return !parts.some((part) => part === ".." || part === "");
}

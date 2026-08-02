const sensitiveKey = /(password|token|secret|private[_-]?key|wifi[_-]?key|product[_-]?key)/i;

export function maskSecrets<T>(value: T): T {
  if (Array.isArray(value)) return value.map(maskSecrets) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, sensitiveKey.test(key) ? "***" : maskSecrets(item)])) as T;
  }
  return value;
}

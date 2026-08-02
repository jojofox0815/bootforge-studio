export interface CompatibilityRule { id: string; family: string; minVersion?: number; maxVersion?: number; signed: boolean; action: string }

export function applicableRules(rules: CompatibilityRule[], family: string, version: number) {
  return rules.filter((rule) => rule.signed && rule.family === family && (rule.minVersion === undefined || version >= rule.minVersion) && (rule.maxVersion === undefined || version <= rule.maxVersion));
}

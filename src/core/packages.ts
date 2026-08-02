export interface PackageNode { id: string; dependencies: string[] }

export function resolvePackageOrder(nodes: PackageNode[]): string[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const visiting = new Set<string>(); const visited = new Set<string>(); const result: string[] = [];
  const visit = (id: string) => {
    if (visited.has(id)) return;
    if (visiting.has(id)) throw new Error(`Dependency cycle at ${id}`);
    const node = byId.get(id); if (!node) throw new Error(`Missing dependency ${id}`);
    visiting.add(id); node.dependencies.forEach(visit); visiting.delete(id); visited.add(id); result.push(id);
  };
  nodes.forEach((node) => visit(node.id)); return result;
}

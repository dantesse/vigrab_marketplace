import type { FieldSchema } from '@/types/auction';

type CatLike = {
  fieldSchema?: any;
  parent?: CatLike | null;
} | null;

/**
 * Walks up from a leaf category to its top ancestor, collecting field
 * definitions. Deeper-node fields override same-name fields from ancestors.
 * Returns a flat list in display order (top-down).
 */
export function collectFieldSchema(cat: CatLike): FieldSchema['fields'] {
  const chain: NonNullable<CatLike>[] = [];
  let node: CatLike = cat;
  while (node) {
    chain.push(node);
    node = node.parent ?? null;
  }
  // Top → leaf order
  chain.reverse();
  const byName = new Map<string, FieldSchema['fields'][number]>();
  for (const c of chain) {
    const fs = c.fieldSchema as FieldSchema | undefined;
    if (!fs?.fields) continue;
    for (const f of fs.fields) byName.set(f.name, f);
  }
  return Array.from(byName.values());
}

/**
 * Given an extraFields blob and the collected field defs, returns
 * `{ label, value }[]` for rendering. Unknown keys (not declared in schema)
 * are appended at the end as raw key/value pairs so legacy data still shows.
 */
export function pairExtraFields(
  extraFields: Record<string, any> | null | undefined,
  fields: FieldSchema['fields']
): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  const known = new Set<string>();
  for (const f of fields) {
    known.add(f.name);
    const v = extraFields?.[f.name];
    if (v === undefined || v === null || v === '') continue;
    out.push({ label: f.label, value: String(v) });
  }
  if (extraFields) {
    for (const [k, v] of Object.entries(extraFields)) {
      if (known.has(k)) continue;
      if (v === undefined || v === null || v === '') continue;
      out.push({ label: k, value: String(v) });
    }
  }
  return out;
}

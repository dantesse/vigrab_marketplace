'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChevronRight } from 'lucide-react';
import type { CategoryNode } from '@/actions/GetCategories';
import type { FieldSchema } from '@/types/auction';

export type CascadeSelection = {
  categoryId: string | null; // deepest node selected
  path: CategoryNode[];      // top → ... → deepest
  fieldSchema: FieldSchema | null;
};

const findById = (nodes: CategoryNode[], id: string): CategoryNode | null => {
  for (const n of nodes) {
    if (n.id === id) return n;
    const hit = findById(n.children, id);
    if (hit) return hit;
  }
  return null;
};

const CategoryCascadePicker = ({
  tree,
  onChange,
}: {
  tree: CategoryNode[];
  onChange: (selection: CascadeSelection) => void;
}) => {
  // ids[i] = the id selected at depth i (0 = top)
  const [ids, setIds] = useState<string[]>([]);

  // Walk the tree along the current selection
  const path: CategoryNode[] = useMemo(() => {
    const out: CategoryNode[] = [];
    let level = tree;
    for (const id of ids) {
      const node = level.find((n) => n.id === id);
      if (!node) break;
      out.push(node);
      level = node.children;
    }
    return out;
  }, [ids, tree]);

  // The list of dropdowns to render: one per existing path level, plus one extra
  // if the deepest selected node still has children.
  const levels: { options: CategoryNode[]; selectedId: string | null }[] = useMemo(() => {
    const out: { options: CategoryNode[]; selectedId: string | null }[] = [];
    let current = tree;
    for (let i = 0; i <= path.length; i++) {
      if (current.length === 0) break;
      out.push({ options: current, selectedId: ids[i] ?? null });
      const node = path[i];
      if (!node) break;
      current = node.children;
    }
    return out;
  }, [tree, path, ids]);

  // The deepest fieldSchema on the path
  const fieldSchema: FieldSchema | null = useMemo(() => {
    for (let i = path.length - 1; i >= 0; i--) {
      const node = path[i];
      if (!node) continue;
      const fs = node.fieldSchema;
      if (fs && fs.fields && fs.fields.length > 0) return fs as FieldSchema;
    }
    return null;
  }, [path]);

  // Emit selection up
  useEffect(() => {
    const deepest = path[path.length - 1] ?? null;
    onChange({
      categoryId: deepest?.id ?? null,
      path,
      fieldSchema,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, fieldSchema]);

  const setLevel = (depth: number, value: string) => {
    const next = ids.slice(0, depth);
    next.push(value);
    setIds(next);
  };

  const labels = ['Huvudkategori', 'Underkategori', 'Produkttyp', 'Träslag'];

  return (
    <div className='flex flex-col gap-3'>
      {levels.map((lvl, depth) => (
        <div key={depth}>
          <Label className='flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground'>
            {depth > 0 && <ChevronRight className='h-3 w-3' />}
            {labels[depth] ?? `Nivå ${depth + 1}`}
          </Label>
          <Select
            value={lvl.selectedId ?? undefined}
            onValueChange={(v) => setLevel(depth, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Välj ${(labels[depth] ?? 'kategori').toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {lvl.options.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
};

export default CategoryCascadePicker;

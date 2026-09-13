'use server';
import prisma from '@repo/db';

export async function getTopCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    include: { children: true },
    orderBy: { name: 'asc' },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: { children: true },
  });
}

export async function getLeafCategories() {
  return prisma.category.findMany({
    where: { children: { none: {} } },
    include: { parent: true },
    orderBy: [{ parent: { name: 'asc' } }, { name: 'asc' }],
  });
}

export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parentId: string | null;
  fieldSchema: any;
  children: CategoryNode[];
};

// Returns the full tree (up to 4 levels) rooted at the top-level categories.
export async function getCategoryTree(): Promise<CategoryNode[]> {
  const all = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      parentId: true,
      fieldSchema: true,
    },
  });

  const byParent = new Map<string | null, typeof all>();
  for (const c of all) {
    const key = c.parentId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  }

  type Row = (typeof all)[number];
  const build = (parentId: string | null): CategoryNode[] =>
    (byParent.get(parentId) ?? []).map((c: Row) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      parentId: c.parentId,
      fieldSchema: c.fieldSchema,
      children: build(c.id),
    }));

  return build(null);
}

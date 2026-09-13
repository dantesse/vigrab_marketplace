'use server';

import prisma from '@repo/db';

// Given a list of category slugs, return the set of category ids consisting of
// each matched node AND every descendant. This lets a click on a top-level
// category surface auctions tagged with any of its children/grand-children.
async function expandSlugsToDescendantIds(slugs: string[]): Promise<string[]> {
  if (slugs.length === 0) return [];

  const all = await prisma.category.findMany({
    select: { id: true, slug: true, parentId: true },
  });

  const bySlug = new Map(all.map((c) => [c.slug, c]));
  const childrenOf = new Map<string, string[]>();
  for (const c of all) {
    if (!c.parentId) continue;
    if (!childrenOf.has(c.parentId)) childrenOf.set(c.parentId, []);
    childrenOf.get(c.parentId)!.push(c.id);
  }

  const matched = new Set<string>();
  const collect = (id: string) => {
    if (matched.has(id)) return;
    matched.add(id);
    for (const childId of childrenOf.get(id) ?? []) collect(childId);
  };
  for (const slug of slugs) {
    const c = bySlug.get(slug);
    if (c) collect(c.id);
  }
  return Array.from(matched);
}

export const getAuctions = async ({
  search,
  offset = 0,
  limit = 10,
  categories,
}: {
  search?: string | undefined;
  offset?: number;
  limit?: number;
  min?: string;
  max?: string;
  status?: string[];
  categories?: string[];
}) => {
  const categoryIds = await expandSlugsToDescendantIds(categories ?? []);

  const where = {
    title: {
      contains: search,
      mode: 'insensitive' as const,
    },
    ...(categoryIds.length > 0 ? { categoryId: { in: categoryIds } } : {}),
  };

  const auctions = await prisma.auction.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });
  const totalCount = await prisma.auction.count({ where });
  const totalPages = Math.ceil(totalCount / limit);
  return { auctions, totalCount, totalPages };
};

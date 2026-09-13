'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, TreePine, Layers, Wrench } from 'lucide-react';
import type { CategoryNode } from '@/actions/GetCategories';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  tree: TreePine,
  planks: Layers,
  excavator: Wrench,
};

const CategoryMegaMenu = ({ tree }: { tree: CategoryNode[] }) => {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <nav
      className='relative hidden md:flex items-center gap-1'
      onMouseLeave={() => setOpenSlug(null)}
    >
      {tree.map((top) => {
        const Icon = ICON_MAP[top.icon ?? ''] ?? TreePine;
        const isOpen = openSlug === top.slug;
        return (
          <div
            key={top.id}
            className='relative'
            onMouseEnter={() => setOpenSlug(top.slug)}
          >
            <Link
              href={`/auctions?category=${top.slug}`}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isOpen
                  ? 'bg-muted text-foreground'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className='h-4 w-4' />
              <span>{top.name}</span>
              {top.children.length > 0 && (
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isOpen && 'rotate-180'
                  )}
                />
              )}
            </Link>

            {/* Panel */}
            {isOpen && top.children.length > 0 && (
              <div className='absolute left-0 top-full pt-2 z-50'>
                <div className='min-w-[680px] max-w-[920px] bg-popover border border-border rounded-xl shadow-xl p-6'>
                  <MegaPanel branches={top.children} topSlug={top.slug} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

const MegaPanel = ({
  branches,
  topSlug,
}: {
  branches: CategoryNode[];
  topSlug: string;
}) => {
  // If branches themselves have children, render each as a column.
  // Otherwise it's a flat list (e.g. species under Timmer) — render as a grid.
  const hasNested = branches.some((b) => b.children.length > 0);

  if (!hasNested) {
    return (
      <div className='grid grid-cols-3 gap-x-6 gap-y-1'>
        {branches.map((b) => (
          <Link
            key={b.id}
            href={`/auctions?category=${b.slug}`}
            className='block py-1.5 text-sm text-foreground/80 hover:text-primary transition-colors'
          >
            {b.name}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div
      className='grid gap-6'
      style={{ gridTemplateColumns: `repeat(${branches.length}, minmax(0, 1fr))` }}
    >
      {branches.map((branch) => (
        <div key={branch.id} className='flex flex-col gap-2'>
          <Link
            href={`/auctions?category=${branch.slug}`}
            className='text-sm font-semibold text-foreground hover:text-primary transition-colors'
          >
            {branch.name}
          </Link>
          <ul className='flex flex-col gap-1'>
            {branch.children.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/auctions?category=${child.slug}`}
                  className='text-sm text-foreground/70 hover:text-primary transition-colors'
                >
                  {child.name}
                </Link>
                {/* 4th-level (e.g. species under Obehandlad virke) — render inline */}
                {child.children.length > 0 && (
                  <ul className='ml-3 mt-1 mb-1 flex flex-col gap-0.5 border-l border-border pl-3'>
                    {child.children.map((leaf) => (
                      <li key={leaf.id}>
                        <Link
                          href={`/auctions?category=${leaf.slug}`}
                          className='text-xs text-foreground/60 hover:text-primary transition-colors'
                        >
                          {leaf.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default CategoryMegaMenu;

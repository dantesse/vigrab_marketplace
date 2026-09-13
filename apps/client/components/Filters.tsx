'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { CategoryNode } from '@/actions/GetCategories';
import { X } from 'lucide-react';

const findBySlug = (
  nodes: CategoryNode[],
  slug: string
): CategoryNode | null => {
  for (const n of nodes) {
    if (n.slug === slug) return n;
    const hit = findBySlug(n.children, slug);
    if (hit) return hit;
  }
  return null;
};

const Filters = ({ tree }: { tree: CategoryNode[] }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeSlug = searchParams.get('category') ?? '';
  const activeNode = useMemo(
    () => (activeSlug ? findBySlug(tree, activeSlug) : null),
    [tree, activeSlug]
  );

  const [status, setStatus] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>();
  const [maxPrice, setMaxPrice] = useState<number>();

  // Hydrate from URL once
  useEffect(() => {
    const s = searchParams.get('s');
    const min = searchParams.get('min');
    const max = searchParams.get('max');
    if (s) setStatus(s.split(','));
    if (min) setMinPrice(Number(min));
    if (max) setMaxPrice(Number(max));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push non-category filters to URL
  useEffect(() => {
    const param = new URLSearchParams(searchParams);
    if (status.length) param.set('s', status.join(','));
    else param.delete('s');
    if (minPrice) param.set('min', minPrice.toString());
    else param.delete('min');
    if (maxPrice) param.set('max', maxPrice.toString());
    else param.delete('max');
    router.replace(`${pathname}?${param.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, minPrice, maxPrice]);

  const clearFiltersHandler = () => {
    setStatus([]);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    router.replace(pathname);
  };

  const setCategory = (slug: string | null) => {
    const param = new URLSearchParams(searchParams);
    if (slug) param.set('category', slug);
    else param.delete('category');
    router.replace(`${pathname}?${param.toString()}`);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus((prev) =>
      prev.includes(newStatus)
        ? prev.filter((s) => s !== newStatus)
        : [...prev, newStatus]
    );
  };

  // Decide what to show in the Categories accordion
  // - No active category → list the three top-level categories
  // - Active category → list its sub-tree
  const renderCategoryList = () => {
    if (!activeNode) {
      return (
        <div className='grid gap-1.5'>
          {tree.map((top) => (
            <button
              key={top.id}
              onClick={() => setCategory(top.slug)}
              className='text-left text-sm font-medium hover:text-primary transition-colors py-1'
            >
              {top.name}
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-between bg-primary/10 rounded-md px-2 py-1.5'>
          <span className='text-sm font-semibold text-primary'>
            {activeNode.name}
          </span>
          <button
            onClick={() => setCategory(null)}
            className='text-muted-foreground hover:text-foreground'
            aria-label='Rensa kategori'
          >
            <X className='h-3.5 w-3.5' />
          </button>
        </div>
        {activeNode.children.length === 0 ? (
          <p className='text-xs text-muted-foreground'>
            Inga underkategorier.
          </p>
        ) : (
          <ul className='flex flex-col gap-0.5'>
            {activeNode.children.map((child) => (
              <li key={child.id}>
                <button
                  onClick={() => setCategory(child.slug)}
                  className='w-full text-left text-sm py-1 hover:text-primary transition-colors'
                >
                  {child.name}
                </button>
                {child.children.length > 0 && (
                  <ul className='ml-3 border-l border-border pl-2 flex flex-col gap-0.5'>
                    {child.children.map((leaf) => (
                      <li key={leaf.id}>
                        <button
                          onClick={() => setCategory(leaf.slug)}
                          className='w-full text-left text-xs text-foreground/70 py-1 hover:text-primary transition-colors'
                        >
                          {leaf.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className='bg-muted rounded-lg p-6 space-y-2 dark:bg-card dark:text-card-foreground'>
      <div className='flex flex-row justify-between items-center'>
        <h3 className='text-lg font-medium'>Filter</h3>
        <button
          className='text-muted-foreground text-sm hover:text-foreground'
          onClick={clearFiltersHandler}
        >
          Rensa
        </button>
      </div>

      <Accordion type='multiple' defaultValue={['cat', 'price', 'status']}>
        <AccordionItem value='cat'>
          <AccordionTrigger>Kategorier</AccordionTrigger>
          <AccordionContent>{renderCategoryList()}</AccordionContent>
        </AccordionItem>

        <AccordionItem value='price'>
          <AccordionTrigger>Pris</AccordionTrigger>
          <AccordionContent className='flex flex-col gap-2'>
            <div className='flex flex-row gap-2 w-full items-center'>
              <Input
                placeholder='Min'
                value={minPrice ?? ''}
                onChange={(e) => setMinPrice(Number(e.target.value) || undefined)}
              />
              <span className='text-muted-foreground'>–</span>
              <Input
                placeholder='Max'
                value={maxPrice ?? ''}
                onChange={(e) => setMaxPrice(Number(e.target.value) || undefined)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='status'>
          <AccordionTrigger>Status</AccordionTrigger>
          <AccordionContent className='flex flex-col gap-1'>
            {[
              { value: 'ACTIVE', label: 'Aktiv' },
              { value: 'ENDED', label: 'Avslutad' },
              { value: 'INACTIVE', label: 'Inaktiv' },
            ].map((s) => (
              <Label
                key={s.value}
                className='flex items-center gap-2 font-normal cursor-pointer'
              >
                <Checkbox
                  checked={status.includes(s.value)}
                  onCheckedChange={() => handleStatusChange(s.value)}
                />
                {s.label}
              </Label>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Filters;

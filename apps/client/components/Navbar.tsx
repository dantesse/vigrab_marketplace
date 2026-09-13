'use client';
import React from 'react';
import Link from 'next/link';
import GavelIcon from './icons/GavelIcon';
import UserIcon from './icons/UserIcon';
import { ModeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';
import { Menu, TreePine, Layers, Wrench, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Session } from 'lucia';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Signout from '@/actions/auth/Signout';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import CategoryMegaMenu from './CategoryMegaMenu';
import type { CategoryNode } from '@/actions/GetCategories';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  tree: TreePine,
  planks: Layers,
  excavator: Wrench,
};

const Navbar = ({
  className,
  session,
  categoryTree,
}: {
  className?: string;
  session: Session | null;
  categoryTree: CategoryNode[];
}) => {
  const router = useRouter();
  const { mutate: server_Signout } = useMutation({
    mutationFn: Signout,
    onSuccess: () => router.push('/'),
  });

  return (
    <header className={cn('flex flex-col', className)}>
      <div className='flex items-center justify-between gap-6 px-6 lg:px-10 py-3'>
        {/* Logo */}
        <Link href='/' className='flex items-center gap-2 shrink-0' prefetch={false}>
          <GavelIcon className='w-6 h-6' />
          <span className='text-xl font-bold hidden md:block'>Vigrab</span>
        </Link>

        {/* Mega menu (desktop, centered) */}
        <div className='flex-1 flex justify-center'>
          <CategoryMegaMenu tree={categoryTree} />
        </div>

        {/* Right actions */}
        <div className='hidden md:flex items-center gap-3 shrink-0'>
          <ModeToggle />
          {session ? (
            <>
              <Link
                href='/new'
                className='px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity'
              >
                + Sälj
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className='flex items-center justify-center border border-[#98989a] rounded-full dark:border-white size-8'>
                    <UserIcon className='w-7 h-7 font-light dark:text-white' />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuLabel>Mitt konto</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/my-auctions')}>
                    Mina auktioner
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/my-bids')}>
                    Mina bud
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => server_Signout()}>
                    Logga ut
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant='ghost' onClick={() => router.push('/sign-in')}>
                Logga in
              </Button>
              <Button onClick={() => router.push('/sign-up')}>
                Bli säljare
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <div className='md:hidden'>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='outline' size='icon'>
                <Menu className='h-5 w-5' />
              </Button>
            </SheetTrigger>
            <SheetContent className='overflow-y-auto'>
              <SheetHeader>
                <SheetTitle>Vigrab</SheetTitle>
              </SheetHeader>
              <div className='flex flex-col gap-2 pt-6'>
                {session ? (
                  <>
                    <SheetClose asChild>
                      <Button variant='default' onClick={() => router.push('/new')}>
                        + Sälj
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant='ghost' onClick={() => router.push('/my-auctions')}>
                        Mina auktioner
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant='ghost' onClick={() => router.push('/my-bids')}>
                        Mina bud
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant='ghost' onClick={() => server_Signout()}>
                        Logga ut
                      </Button>
                    </SheetClose>
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button variant='ghost' onClick={() => router.push('/sign-in')}>
                        Logga in
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button onClick={() => router.push('/sign-up')}>
                        Bli säljare
                      </Button>
                    </SheetClose>
                  </>
                )}
                {/* Mobile category tree */}
                <div className='border-t border-border pt-4 mt-2 flex flex-col gap-3'>
                  <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                    Kategorier
                  </p>
                  {categoryTree.map((top) => {
                    const Icon = ICON_MAP[top.icon ?? ''] ?? TreePine;
                    return (
                      <div key={top.id} className='flex flex-col gap-1'>
                        <SheetClose asChild>
                          <Link
                            href={`/auctions?category=${top.slug}`}
                            className='flex items-center gap-2 font-medium text-sm py-1.5'
                          >
                            <Icon className='h-4 w-4' />
                            {top.name}
                          </Link>
                        </SheetClose>
                        <div className='ml-6 flex flex-col gap-0.5'>
                          {top.children.map((sub) => (
                            <SheetClose asChild key={sub.id}>
                              <Link
                                href={`/auctions?category=${sub.slug}`}
                                className='flex items-center gap-1 text-sm text-foreground/70 py-1'
                              >
                                <ChevronRight className='h-3 w-3' />
                                {sub.name}
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className='flex justify-center mt-4'>
                  <ModeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

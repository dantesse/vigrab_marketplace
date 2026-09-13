import { getTopCategories } from '@/actions/GetCategories';
import Link from 'next/link';
import { TreePine, Layers, Wrench, Search } from 'lucide-react';
import type { ComponentType } from 'react';
import type { Category } from '@prisma/client';

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  tree: TreePine,
  planks: Layers,
  excavator: Wrench,
};

export default async function Page() {
  const categories = await getTopCategories();

  return (
    <main className='flex flex-col flex-1 bg-background'>
      {/* Category strip — top band, ~20vh */}
      <section className='w-full border-b border-border bg-card/40'>
        <div className='grid grid-cols-1 sm:grid-cols-3 max-w-6xl mx-auto'>
          {categories.map((cat: Category & { children: Category[] }) => {
            const Icon = ICON_MAP[cat.icon ?? ''] ?? TreePine;
            return (
              <Link
                key={cat.id}
                href={`/auctions?category=${cat.slug}`}
                className='flex flex-col items-center justify-center gap-3 h-[20vh] min-h-[140px] px-6 border-border sm:border-r last:border-r-0 hover:bg-muted/60 transition-colors group'
              >
                <div className='flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors'>
                  <Icon className='h-7 w-7 text-primary' />
                </div>
                <span className='text-lg font-semibold text-center leading-tight'>
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Hero — plain background */}
      <section className='relative flex flex-col items-center justify-center gap-4 px-6 py-24 text-center bg-background'>
        {/* Search — positioned NW of the hero title */}
        <form
          action='/auctions'
          method='GET'
          className='absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 bg-card border border-border rounded-full shadow-sm pl-4 pr-1 py-1 w-[min(420px,75vw)]'
        >
          <Search className='h-4 w-4 text-muted-foreground shrink-0' />
          <input
            name='query'
            type='search'
            placeholder='Sök efter timmer, maskiner, virke…'
            className='flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground'
          />
          <button
            type='submit'
            className='px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity'
          >
            Sök
          </button>
        </form>

        <h1 className='text-4xl font-extrabold tracking-tight md:text-5xl'>
          Vigrab — vi älskar trä
        </h1>
        <p className='max-w-xl text-lg text-muted-foreground'>
          Timmer, träprodukter och maskiner — köp och sälj på auktion.
        </p>
        <div className='flex gap-3 mt-2'>
          <Link
            href='/auctions'
            className='px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-sm'
          >
            Bläddra auktioner
          </Link>
          <Link
            href='/new'
            className='px-6 py-3 rounded-xl border border-border bg-card font-semibold hover:bg-muted transition-colors shadow-sm'
          >
            Sälj en vara
          </Link>
        </div>
      </section>

      {/* Footer image band — ~30vh */}
      <section
        className='w-full h-[30vh] min-h-[200px] bg-cover bg-center bg-no-repeat border-t border-border'
        style={{ backgroundImage: "url('/hero-logs.jpg')" }}
        aria-hidden='true'
      />
    </main>
  );
}

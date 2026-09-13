import { getAuctions } from '@/actions/GetAuctions';
import { getCategoryTree } from '@/actions/GetCategories';
import Filters from '@/components/Filters';
import Auctions from '@/components/pages/Auctions';
import PaginationWrapper from '@/components/PaginationWrapper';

export default async function AuctionsPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
    limit?: string;
    min?: string;
    max?: string;
    s?: string[];
    categories?: string[];
    category?: string;
  };
}) {
  const search = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 12;
  const offset = (currentPage - 1) * limit;
  const categories =
    searchParams?.categories ||
    (searchParams?.category ? [searchParams.category] : []);

  const [{ auctions, totalPages }, tree] = await Promise.all([
    getAuctions({ offset, limit, search, categories }),
    getCategoryTree(),
  ]);

  return (
    <div className='flex-1 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4 p-5 dark:bg-background'>
      <Filters tree={tree} />
      <div className='flex flex-col gap-5'>
        <Auctions auctions={auctions} />
        <PaginationWrapper totalPages={totalPages} />
      </div>
    </div>
  );
}

'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { bidStore } from '@/zustand/bidStore';
import { AuctionWithBidsWithUsersAndUserT } from '@repo/db/types';
import date from 'date-and-time';
import { User } from 'lucia';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuctionTimer from '../AuctionTimer';
import BidDialog from '../BidDialog';
import { Button } from '../ui/button';
import ImageGallery from '../ImageGallery';
import { collectFieldSchema, pairExtraFields } from '@/lib/extraFields';

const WS_URL = process.env.WS_URL ?? 'ws://localhost:8080';

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('sv-SE').format(amount);

const Auction = ({
  user,
  auction,
}: {
  user: User | null;
  auction: AuctionWithBidsWithUsersAndUserT;
}) => {
  const [userInfo, setUserInfo] = useState<User | null | undefined>(user);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { initBids, bids, currentAmount, setCurrentAmount } = bidStore();

  useEffect(() => {
    setCurrentAmount(auction.currentPrice);
    initBids(auction.bids);
    if (!user) {
      setUserInfo({
        id: 'test',
        email: 'test@test.com',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_URL}?userId=${user?.id}&auctionId=${auction.id}`
    );
    ws.onopen = () => setSocket(ws);
    ws.onclose = () => setSocket(null);
    return () => ws.close();
  }, [user, auction.id]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModal = () => setIsModalOpen(!isModalOpen);
  const router = useRouter();

  // Images: prefer images[], fall back to single image
  const a = auction as typeof auction & {
    images?: string[];
    category?: any;
    extraFields?: Record<string, any> | null;
  };
  const images: string[] =
    Array.isArray(a.images) && a.images.length > 0
      ? a.images
      : a.image
      ? [a.image]
      : [];

  // Category breadcrumb (top → leaf)
  const buildBreadcrumb = (): string[] => {
    const out: string[] = [];
    let n: any = a.category;
    while (n) {
      out.push(n.name);
      n = n.parent ?? null;
    }
    return out.reverse();
  };
  const breadcrumb = buildBreadcrumb();

  // Detail rows from extraFields
  const fieldDefs = collectFieldSchema(a.category ?? null);
  const detailRows = pairExtraFields(a.extraFields ?? null, fieldDefs);

  return (
    <div className='flex flex-col items-center justify-center h-full p-4 bg-background md:p-8'>
      <div className='grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2'>
        {/* LEFT: gallery + title + details */}
        <div className='flex flex-col gap-5'>
          <ImageGallery images={images} alt={auction.title} />

          <div className='flex flex-col gap-1'>
            {breadcrumb.length > 0 && (
              <p className='text-xs text-muted-foreground'>
                {breadcrumb.join(' › ')}
              </p>
            )}
            <h1 className='text-2xl font-bold'>{auction.title}</h1>
            <p className='text-muted-foreground flex flex-row gap-1'>
              Säljs av: <span className='font-bold'>{auction.user.userName}</span>
            </p>
            <p className='text-muted-foreground mt-2 whitespace-pre-wrap'>
              {auction.description}
            </p>
          </div>

          {detailRows.length > 0 && (
            <div className='rounded-lg border border-border p-4 bg-card'>
              <h2 className='text-base font-semibold mb-3'>Produktdetaljer</h2>
              <dl className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm'>
                {detailRows.map((row) => (
                  <div
                    key={row.label}
                    className='flex justify-between border-b border-border/50 pb-1'
                  >
                    <dt className='text-muted-foreground'>{row.label}</dt>
                    <dd className='font-medium text-right'>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {/* RIGHT: bid panel + history */}
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col gap-2 p-4 rounded-lg bg-card border border-border'>
            <div className='flex items-center justify-between'>
              <span className='text-lg font-semibold'>Nuvarande bud</span>
              <span className='text-2xl font-bold text-primary'>
                {formatMoney(currentAmount)} kr
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-lg font-semibold'>Utropspris</span>
              <span className='text-2xl font-bold text-primary'>
                {formatMoney(auction.startingPrice)} kr
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-lg font-semibold'>Tid kvar</span>
              <span className='text-2xl font-bold text-primary'>
                {new Date(auction.startDate) < new Date() &&
                new Date(auction.endDate) > new Date() ? (
                  <AuctionTimer
                    auctionId={auction.id}
                    userId={userInfo?.id as string}
                    socket={socket}
                  />
                ) : new Date(auction.startDate) < new Date() &&
                  new Date(auction.endDate) < new Date() ? (
                  <>Avslutad</>
                ) : (
                  <>Ej startad</>
                )}
              </span>
            </div>
            {user?.id == auction.userId ? (
              <Button disabled>Denna auktion är din egen</Button>
            ) : userInfo?.id !== 'test' ? (
              bids[0]?.user.id === user?.id ? (
                <Button disabled>Du har högsta budet</Button>
              ) : (
                <BidDialog
                  handleModal={handleModal}
                  value={isModalOpen}
                  startPrice={auction.currentPrice}
                  currentPrice={auction.currentPrice}
                  auctionId={auction.id}
                  userId={userInfo?.id as string}
                  socket={socket}
                />
              )
            ) : (
              <Button
                onClick={() => router.push('/sign-in')}
                className='w-full'
              >
                Logga in för att lägga bud
              </Button>
            )}
          </div>

          <div className='flex flex-col gap-4 p-6 rounded-lg bg-card border border-border'>
            <h2 className='text-xl font-bold'>Budhistorik</h2>
            <Table containerClassname='h-fit max-h-80 overflow-y-auto relative dark:border--card rounded-xl border border--card dark:border'>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[100px]'>Budgivare</TableHead>
                  <TableHead>Tidpunkt</TableHead>
                  <TableHead className='text-right'>Belopp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bids.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3}>Inga bud än</TableCell>
                  </TableRow>
                ) : (
                  bids.map((bid, index) => (
                    <TableRow key={index}>
                      <TableCell className='font-medium'>
                        {bid.user.userName}
                      </TableCell>
                      <TableCell>
                        {date.format(
                          new Date(bid.createdAt),
                          'YYYY-MM-DD HH:mm:ss'
                        )}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatMoney(bid.amount)} kr
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auction;

'use server';
import { AuctionT } from '@/types/auction';
import prisma, { Prisma } from '@repo/db';
import { revalidatePath } from 'next/cache';

export const createAuction = async (
  data: AuctionT,
  imgUrls: string[],
  userId: string
) => {
  const cover = imgUrls[0] ?? '';
  try {
    await prisma.auction.create({
      data: {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId || null,
        extraFields: data.extraFields ?? Prisma.JsonNull,
        startDate: data.startDate,
        endDate: data.endDate,
        currentPrice: 0,
        startingPrice: data.startingPrice,
        image: cover,
        images: imgUrls,
        status: 'INACTIVE',
        userId: userId,
      },
    });
  } catch (error) {
    throw error;
  }

  revalidatePath('/my-auctions');
  return {};
};

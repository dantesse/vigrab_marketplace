import { z } from 'zod';

export enum AuctionStatus {
  ACTIVE,
  ENDED,
  CANCELLED,
  INACTIVE,
}

export const Auctionschema = z
  .object({
    title: z
      .string()
      .min(1, { message: 'Title is required' })
      .max(50, { message: 'Title is too long' }),
    description: z.string().min(1, { message: 'Description is required' }),
    startingPrice: z.number().min(1, { message: 'Starting price is required' }),
    startDate: z.date().refine((date) => date > new Date(), {
      message: 'Start date must be in the future',
    }),
    endDate: z.date().refine((date) => date > new Date(), {
      message: 'End date must be in the future',
    }),
    categoryId: z.string().min(1, { message: 'Category is required' }),
    extraFields: z.record(z.string(), z.any()).optional(),
    images: z.array(z.string().url()).optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export type AuctionT = z.infer<typeof Auctionschema>;

export type FieldSchema = {
  fields: {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select';
    options?: string[];
    required: boolean;
  }[];
};

export type bidT = {
  id: string;
  amount: number;
  createdAt: Date;
  userId: string;
  auctionId: string;
};

export type auctionType = {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  startDate: Date;
  endDate: Date;
  status: 'INACTIVE' | 'ACTIVE' | 'ENDED';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  image: string;
  categoryId: string | null;
  extraFields: Record<string, any> | null;
  bids: bidT[];
  user: {
    id: string;
    userName: string;
    email: string;
    hashedPassword: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

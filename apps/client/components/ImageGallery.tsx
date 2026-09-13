'use client';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const ImageGallery = ({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) => {
  const [active, setActive] = useState(0);
  if (images.length === 0) return null;
  const current = images[active] ?? images[0]!;
  return (
    <div className='flex flex-col gap-3'>
      <div className='relative w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden border border-border'>
        <Image
          src={current}
          alt={alt}
          fill
          sizes='(max-width: 768px) 100vw, 50vw'
          className='object-contain'
          priority
        />
      </div>
      {images.length > 1 && (
        <div className='flex gap-2 overflow-x-auto pb-1'>
          {images.map((url, i) => (
            <button
              key={url}
              type='button'
              onClick={() => setActive(i)}
              className={cn(
                'relative size-16 shrink-0 rounded-md overflow-hidden border-2 transition-colors',
                i === active
                  ? 'border-primary'
                  : 'border-border hover:border-foreground/40'
              )}
            >
              <Image
                src={url}
                alt={`${alt} ${i + 1}`}
                fill
                sizes='64px'
                className='object-cover'
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;

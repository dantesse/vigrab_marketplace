"use client";

import { OurFileRouter } from "@/app/api/uploadthing/core";
import { UploadDropzone } from "@uploadthing/react";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { X, Star } from "lucide-react";

interface ImageUploadProps {
  /** Called whenever the list of uploaded images changes. First entry is the cover image. */
  ImageURLs: (urls: string[]) => void;
  /** Maximum images allowed. Defaults to 8 (matches uploadthing route config). */
  maxImages?: number;
}

export default function ImageUpload({
  ImageURLs,
  maxImages = 8,
}: ImageUploadProps) {
  const [urls, setUrls] = useState<string[]>([]);

  const update = (next: string[]) => {
    setUrls(next);
    ImageURLs(next);
  };

  const remove = (idx: number) => update(urls.filter((_, i) => i !== idx));

  const makeCover = (idx: number) => {
    if (idx === 0) return;
    const next = [urls[idx]!, ...urls.filter((_, i) => i !== idx)];
    update(next);
  };

  const remaining = Math.max(0, maxImages - urls.length);

  return (
    <div className="w-full flex flex-col gap-3">
      {urls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {urls.map((url, idx) => (
            <div
              key={url}
              className="relative aspect-square rounded-md overflow-hidden border border-border group"
            >
              <Image
                alt={`Bild ${idx + 1}`}
                src={url}
                fill
                className="object-cover"
                sizes="200px"
              />
              {idx === 0 && (
                <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  Omslag
                </span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-start justify-end p-1 gap-1 opacity-0 group-hover:opacity-100">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => makeCover(idx)}
                    title="Använd som omslag"
                    className="bg-white text-black rounded-full p-1 hover:bg-primary hover:text-primary-foreground"
                  >
                    <Star className="size-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  title="Ta bort"
                  className="bg-white text-black rounded-full p-1 hover:bg-red-500 hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {remaining > 0 ? (
        <div>
          <UploadDropzone<OurFileRouter, "imageUploader">
            className="dark:text-white ut-label:dark:text-white ut-label:text-black dark:border-dashed dark:border-border ut-button:bg-primary ut-button:dark:bg-primary ut-button:dark:text-black ut-button:hover:cursor-pointer"
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              if (!res) return;
              const newUrls = res.map((r) => r.url).filter(Boolean);
              const next = [...urls, ...newUrls].slice(0, maxImages);
              update(next);
              toast.success(
                newUrls.length === 1
                  ? "Bild uppladdad!"
                  : `${newUrls.length} bilder uppladdade!`
              );
            }}
            onUploadError={(error: Error) => {
              console.error("Upload error:", error);
              toast.error("Kunde inte ladda upp. Försök igen.");
            }}
          />
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {urls.length} / {maxImages} bilder
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center">
          Max {maxImages} bilder. Ta bort en för att lägga till fler.
        </p>
      )}
    </div>
  );
}

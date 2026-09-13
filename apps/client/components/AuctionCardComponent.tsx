"use client";
import { User } from "lucia";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";

type AuctionT = {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  image: string;
  images?: string[];
  category?: { name: string } | null;
  extraFields?: any;
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("sv-SE").format(amount);

// Pick up to 3 "headline" fields to surface on the card. We pick by likely
// importance: brand/model/year/dimensions/species/volume — falling back to
// whatever the first few keys are.
const HEADLINE_PRIORITY = [
  "brand",
  "model",
  "year",
  "hours",
  "machine_type",
  "treatment_class",
  "dimensions",
  "length_m",
  "thickness_mm",
  "sheet_size",
  "species",
  "volume_m3",
  "grade",
  "type",
  "product_type",
];

const HEADLINE_LABELS: Record<string, string> = {
  brand: "Märke",
  model: "Modell",
  year: "Årsmodell",
  hours: "Timmar",
  machine_type: "Maskintyp",
  treatment_class: "NTR",
  dimensions: "Dim.",
  length_m: "Längd",
  thickness_mm: "Tjocklek",
  sheet_size: "Format",
  species: "Träslag",
  volume_m3: "Volym",
  grade: "Kvalitet",
  type: "Typ",
  product_type: "Produkt",
};

function pickHeadlineFields(
  extra: Record<string, any> | null | undefined
): { label: string; value: string }[] {
  if (!extra) return [];
  const out: { label: string; value: string }[] = [];
  const seen = new Set<string>();
  for (const key of HEADLINE_PRIORITY) {
    if (out.length >= 3) break;
    const v = extra[key];
    if (v === undefined || v === null || v === "") continue;
    out.push({ label: HEADLINE_LABELS[key] ?? key, value: String(v) });
    seen.add(key);
  }
  if (out.length < 3) {
    for (const [k, v] of Object.entries(extra)) {
      if (out.length >= 3) break;
      if (seen.has(k)) continue;
      if (v === undefined || v === null || v === "") continue;
      out.push({ label: k, value: String(v) });
    }
  }
  return out;
}

const AuctionCardComponent = ({
  user,
  auction,
}: {
  user?: User | null;
  auction: AuctionT;
}) => {
  const router = useRouter();
  const cover =
    auction.images && auction.images.length > 0
      ? auction.images[0]
      : auction.image;
  const imageCount =
    auction.images && auction.images.length > 0
      ? auction.images.length
      : auction.image
      ? 1
      : 0;
  const headline = pickHeadlineFields(auction.extraFields);

  const now = new Date();
  const started = new Date(auction.startDate) < now;
  const ended = new Date(auction.endDate) < now;
  const live = started && !ended;
  const displayPrice = live
    ? auction.currentPrice === 0
      ? auction.startingPrice
      : auction.currentPrice
    : auction.startingPrice;

  return (
    <div className="relative overflow-hidden rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow group border border-border dark:border-border">
      <div className="relative p-2">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={auction.title}
            width={300}
            height={300}
            className="w-full h-60 rounded-md object-cover"
          />
        ) : (
          <div className="rounded-md bg-muted">
            <div className="flex h-60 w-full items-center justify-center">
              <div className="text-muted-foreground">Ingen bild</div>
            </div>
          </div>
        )}
        {imageCount > 1 && (
          <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-semibold bg-black/60 text-white rounded">
            +{imageCount - 1}
          </span>
        )}
      </div>
      <div className="px-4 pt-2 pb-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary text-primary-foreground">
            {auction.category?.name ?? "Okategoriserad"}
          </span>
          {!live && started && ended && (
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Avslutad
            </span>
          )}
          {!started && (
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Ej startad
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold leading-tight line-clamp-1">
          {auction.title}
        </h3>

        {headline.length > 0 && (
          <ul className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            {headline.map((row) => (
              <li key={row.label}>
                <span className="opacity-70">{row.label}:</span>{" "}
                <span className="font-medium text-foreground/90">
                  {row.value}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between mt-1">
          <span className="text-base font-semibold">
            {formatMoney(displayPrice)} kr
          </span>
          <Button
            className="dark:bg-card-foreground"
            size="sm"
            onClick={() => router.push(`/auction/${auction.id}`)}
          >
            {live
              ? "Lägg bud"
              : !started
              ? "Visa (ej startad)"
              : "Visa (avslutad)"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuctionCardComponent;

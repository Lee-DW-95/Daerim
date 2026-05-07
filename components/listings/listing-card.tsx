import Link from "next/link";
import { ArrowRight, Compass, Building2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatManwon, formatPyeong } from "@/lib/format";
import { getComplex } from "@/lib/data/complexes";
import {
  DEAL_KIND_LABEL,
  DIRECTION_LABEL,
  STATUS_LABEL,
  type Listing,
} from "@/lib/types/listing";

type Props = {
  listing: Listing;
};

export function ListingCard({ listing }: Props) {
  const complex = getComplex(listing.complexId);

  const priceLabel =
    listing.dealKind === "monthly" && listing.monthlyRentManwon
      ? `${formatManwon(listing.priceManwon, { unit: "auto" })} / 월 ${listing.monthlyRentManwon}만원`
      : formatManwon(listing.priceManwon, { unit: "auto" });

  return (
    <Link href={`/listings/${listing.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-colors group-hover:border-primary/40">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          {listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.headline}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-sm text-muted-foreground">
              <Building2 className="h-10 w-10 opacity-50" />
              <p className="mt-2 text-xs">사진은 곧 업데이트됩니다</p>
            </div>
          )}
          <div className="absolute left-3 top-3 flex gap-1.5">
            <Badge>{DEAL_KIND_LABEL[listing.dealKind]}</Badge>
            {listing.status !== "available" && (
              <Badge variant="secondary">
                {STATUS_LABEL[listing.status]}
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {complex?.shortName ?? "단지"}
            </span>
            <span>·</span>
            <span>{formatPyeong(listing.sizePyeong)}</span>
            <span>·</span>
            <span>
              {listing.currentFloor}
              {listing.totalFloor ? `/${listing.totalFloor}` : ""}층
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-0.5">
              <Compass className="h-3 w-3" />
              {DIRECTION_LABEL[listing.direction]}
            </span>
          </div>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug">
            {listing.headline}
          </h3>
          <p className="text-xl font-bold tabular-nums">{priceLabel}</p>
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-muted-foreground">
              입주 {listing.availableFrom}
            </span>
            <span className="inline-flex items-center text-primary group-hover:underline">
              자세히 보기
              <ArrowRight className="ml-0.5 h-3 w-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

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
      <Card className="card-lift h-full overflow-hidden border-border/80">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-secondary to-secondary/40">
          {listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.headline}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-sm text-muted-foreground">
              <Building2 className="h-10 w-10 opacity-40" />
              <p className="mt-2 text-xs">사진은 곧 업데이트됩니다</p>
            </div>
          )}
          {/* gradient overlay for legibility */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent"
          />
          <div className="absolute left-3 top-3 flex gap-1.5">
            <Badge className="shadow-sm">
              {DEAL_KIND_LABEL[listing.dealKind]}
            </Badge>
            {listing.status !== "available" && (
              <Badge variant="secondary" className="shadow-sm">
                {STATUS_LABEL[listing.status]}
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="space-y-3 p-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {complex?.shortName ?? "단지"}
            </span>
            <span className="text-border">|</span>
            <span>{formatPyeong(listing.sizePyeong)}</span>
            <span className="text-border">|</span>
            <span className="tabular-nums">
              {listing.currentFloor}
              {listing.totalFloor ? `/${listing.totalFloor}` : ""}층
            </span>
            <span className="text-border">|</span>
            <span className="inline-flex items-center gap-0.5">
              <Compass className="h-3 w-3" />
              {DIRECTION_LABEL[listing.direction]}
            </span>
          </div>
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight">
            {listing.headline}
          </h3>
          <p className="text-xl font-bold tabular-nums tracking-tight">
            {priceLabel}
          </p>
          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
            <span className="text-muted-foreground">
              입주 {listing.availableFrom}
            </span>
            <span className="inline-flex items-center font-medium text-primary">
              자세히 보기
              <ArrowRight className="ml-0.5 h-3 w-3 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

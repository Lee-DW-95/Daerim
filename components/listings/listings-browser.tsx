"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { ListingCard } from "@/components/listings/listing-card";
import { complexes } from "@/lib/data/complexes";
import { DEAL_KIND_LABEL } from "@/lib/types/listing";

import type {
  Listing,
  ListingDealKind,
} from "@/lib/types/listing";
import type { ComplexId } from "@/lib/types/complex";

type SortKey = "latest" | "priceAsc" | "priceDesc";

const SORT_LABEL: Record<SortKey, string> = {
  latest: "최신순",
  priceAsc: "가격 낮은순",
  priceDesc: "가격 높은순",
};

type Props = {
  listings: Listing[];
};

export function ListingsBrowser({ listings }: Props) {
  const [complexId, setComplexId] = React.useState<ComplexId | "all">("all");
  const [dealKind, setDealKind] = React.useState<ListingDealKind | "all">("all");
  const [sizePyeong, setSizePyeong] = React.useState<number | "all">("all");
  const [sort, setSort] = React.useState<SortKey>("latest");

  const availableComplexes = React.useMemo(() => {
    const ids = new Set(listings.map((l) => l.complexId));
    return complexes.filter((c) => ids.has(c.id));
  }, [listings]);

  const availableSizes = React.useMemo(() => {
    const sizes = new Set<number>();
    for (const l of listings) {
      if (complexId !== "all" && l.complexId !== complexId) continue;
      sizes.add(l.sizePyeong);
    }
    return [...sizes].sort((a, b) => a - b);
  }, [listings, complexId]);

  // 단지 변경 시 평형 필터 자동 보정.
  React.useEffect(() => {
    if (sizePyeong !== "all" && !availableSizes.includes(sizePyeong)) {
      setSizePyeong("all");
    }
  }, [availableSizes, sizePyeong]);

  const filtered = React.useMemo(() => {
    const f = listings.filter((l) => {
      if (complexId !== "all" && l.complexId !== complexId) return false;
      if (dealKind !== "all" && l.dealKind !== dealKind) return false;
      if (sizePyeong !== "all" && l.sizePyeong !== sizePyeong) return false;
      return true;
    });

    if (sort === "priceAsc") return [...f].sort((a, b) => a.priceManwon - b.priceManwon);
    if (sort === "priceDesc") return [...f].sort((a, b) => b.priceManwon - a.priceManwon);
    return [...f].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [listings, complexId, dealKind, sizePyeong, sort]);

  const activeFilters =
    Number(complexId !== "all") +
    Number(dealKind !== "all") +
    Number(sizePyeong !== "all");

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-border bg-card p-4 md:p-6">
        <FilterRow label="단지">
          <FilterChip
            active={complexId === "all"}
            onClick={() => setComplexId("all")}
          >
            전체
          </FilterChip>
          {availableComplexes.map((c) => (
            <FilterChip
              key={c.id}
              active={complexId === c.id}
              onClick={() => setComplexId(c.id)}
            >
              {c.shortName}
            </FilterChip>
          ))}
        </FilterRow>

        <FilterRow label="거래 유형">
          <FilterChip
            active={dealKind === "all"}
            onClick={() => setDealKind("all")}
          >
            전체
          </FilterChip>
          {(Object.keys(DEAL_KIND_LABEL) as ListingDealKind[]).map((k) => (
            <FilterChip
              key={k}
              active={dealKind === k}
              onClick={() => setDealKind(k)}
            >
              {DEAL_KIND_LABEL[k]}
            </FilterChip>
          ))}
        </FilterRow>

        {availableSizes.length > 0 && (
          <FilterRow label="평형">
            <FilterChip
              active={sizePyeong === "all"}
              onClick={() => setSizePyeong("all")}
            >
              전체
            </FilterChip>
            {availableSizes.map((p) => (
              <FilterChip
                key={p}
                active={sizePyeong === p}
                onClick={() => setSizePyeong(p)}
              >
                {p}평
              </FilterChip>
            ))}
          </FilterRow>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">
              {filtered.length}건
            </span>
            {activeFilters > 0 && (
              <span className="ml-2 text-xs">
                · 필터 {activeFilters}개 적용 중
                <button
                  type="button"
                  onClick={() => {
                    setComplexId("all");
                    setDealKind("all");
                    setSizePyeong("all");
                  }}
                  className="ml-2 text-primary underline-offset-4 hover:underline"
                >
                  초기화
                </button>
              </span>
            )}
          </p>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">정렬</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-md border border-border bg-background px-2 py-1 text-sm"
            >
              {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
                <option key={k} value={k}>
                  {SORT_LABEL[k]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center text-sm text-muted-foreground">
          조건에 맞는 매물이 없습니다. 필터를 완화하거나 운영자에게 직접
          문의 주세요.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <ListingCard key={l.slug} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="min-w-[64px] text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-secondary"
      )}
    >
      {children}
    </button>
  );
}

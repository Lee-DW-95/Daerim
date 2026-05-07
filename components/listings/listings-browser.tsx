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
  // 다중 선택. 빈 set = 전체.
  const [complexIds, setComplexIds] = React.useState<Set<ComplexId>>(new Set());
  const [dealKinds, setDealKinds] = React.useState<Set<ListingDealKind>>(
    new Set()
  );
  const [sizes, setSizes] = React.useState<Set<number>>(new Set());
  const [sort, setSort] = React.useState<SortKey>("latest");

  // 어드민 등록 폼과 일관되게 모든 단지를 chip으로 노출.
  // 매물 0건인 단지도 chip은 보이고, 카운트로 빈 상태를 표시.
  const allComplexes = React.useMemo(() => complexes, []);

  const countByComplex = React.useMemo(() => {
    const m = new Map<ComplexId, number>();
    for (const c of allComplexes) m.set(c.id, 0);
    for (const l of listings) {
      m.set(l.complexId, (m.get(l.complexId) ?? 0) + 1);
    }
    return m;
  }, [listings, allComplexes]);

  // 평형 칩은 "현재 단지 필터에 매칭되는 매물의 평형"만 보여줌.
  const availableSizes = React.useMemo(() => {
    const set = new Set<number>();
    for (const l of listings) {
      if (complexIds.size > 0 && !complexIds.has(l.complexId)) continue;
      if (dealKinds.size > 0 && !dealKinds.has(l.dealKind)) continue;
      set.add(l.sizePyeong);
    }
    return [...set].sort((a, b) => a - b);
  }, [listings, complexIds, dealKinds]);

  // 단지/거래유형 변경 시 평형 선택 중 사라진 것 자동 정리.
  React.useEffect(() => {
    setSizes((prev) => {
      const next = new Set(
        [...prev].filter((p) => availableSizes.includes(p))
      );
      return next.size === prev.size ? prev : next;
    });
  }, [availableSizes]);

  const filtered = React.useMemo(() => {
    const f = listings.filter((l) => {
      if (complexIds.size > 0 && !complexIds.has(l.complexId)) return false;
      if (dealKinds.size > 0 && !dealKinds.has(l.dealKind)) return false;
      if (sizes.size > 0 && !sizes.has(l.sizePyeong)) return false;
      return true;
    });

    if (sort === "priceAsc")
      return [...f].sort((a, b) => a.priceManwon - b.priceManwon);
    if (sort === "priceDesc")
      return [...f].sort((a, b) => b.priceManwon - a.priceManwon);
    return [...f].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [listings, complexIds, dealKinds, sizes, sort]);

  const activeFilters = complexIds.size + dealKinds.size + sizes.size;

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-border bg-card p-4 md:p-6">
        <FilterRow
          label="단지"
          hint={complexIds.size === 0 ? "전체" : `${complexIds.size}개 선택`}
        >
          {allComplexes.map((c) => {
            const count = countByComplex.get(c.id) ?? 0;
            const active = complexIds.has(c.id);
            return (
              <FilterChip
                key={c.id}
                active={active}
                onClick={() => setComplexIds((prev) => toggle(prev, c.id))}
                disabled={count === 0 && !active}
              >
                <span>{c.shortName}</span>
                <span
                  className={cn(
                    "ml-1.5 text-[10px] tabular-nums",
                    active ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </FilterChip>
            );
          })}
        </FilterRow>

        <FilterRow
          label="거래 유형"
          hint={dealKinds.size === 0 ? "전체" : `${dealKinds.size}개 선택`}
        >
          {(Object.keys(DEAL_KIND_LABEL) as ListingDealKind[]).map((k) => (
            <FilterChip
              key={k}
              active={dealKinds.has(k)}
              onClick={() => setDealKinds((prev) => toggle(prev, k))}
            >
              {DEAL_KIND_LABEL[k]}
            </FilterChip>
          ))}
        </FilterRow>

        {availableSizes.length > 0 && (
          <FilterRow
            label="평형"
            hint={sizes.size === 0 ? "전체" : `${sizes.size}개 선택`}
          >
            {availableSizes.map((p) => (
              <FilterChip
                key={p}
                active={sizes.has(p)}
                onClick={() => setSizes((prev) => toggle(prev, p))}
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
                    setComplexIds(new Set());
                    setDealKinds(new Set());
                    setSizes(new Set());
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
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="min-w-[64px] text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-1 flex-wrap items-center gap-1.5">
        {children}
      </div>
      {hint && (
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {hint}
        </span>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-secondary",
        disabled && "cursor-not-allowed opacity-50 hover:bg-background"
      )}
    >
      {children}
    </button>
  );
}

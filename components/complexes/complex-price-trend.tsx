"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { formatPyeong, formatManwon, formatCount } from "@/lib/format";
import { PriceHistoryChart } from "@/components/charts/price-history-chart";

import type { ComplexId } from "@/lib/types/complex";
import type { PriceHistorySeries } from "@/components/tools/price-history-tool";

type Props = {
  complexId: ComplexId;
  trade: PriceHistorySeries[];
  monthLabels: string[];
};

export function ComplexPriceTrend({ trade, monthLabels }: Props) {
  const sizes = React.useMemo(() => {
    const set = new Set<number>();
    for (const s of trade) set.add(s.sizePyeong);
    return [...set].sort((a, b) => a - b);
  }, [trade]);

  const [size, setSize] = React.useState<number | null>(sizes[0] ?? null);

  React.useEffect(() => {
    if (sizes.length === 0) {
      setSize(null);
      return;
    }
    if (size == null || !sizes.includes(size)) setSize(sizes[0]);
  }, [sizes, size]);

  const chartData = React.useMemo(() => {
    if (size == null) return [];
    const map = new Map<string, PriceHistorySeries>();
    for (const s of trade) {
      if (s.sizePyeong === size) map.set(s.yearMonth, s);
    }
    return monthLabels.map((ym) => {
      const s = map.get(ym);
      return {
        yearMonth: ym,
        avgManwon: s?.avgManwon ?? 0,
        medianManwon: s?.medianManwon ?? 0,
        count: s?.count ?? 0,
      };
    });
  }, [trade, size, monthLabels]);

  const points = chartData.filter((p) => p.count > 0);
  const totalDeals = points.reduce((sum, p) => sum + p.count, 0);
  const overallAvg =
    totalDeals === 0
      ? 0
      : Math.round(
          points.reduce((s, p) => s + p.avgManwon * p.count, 0) / totalDeals
        );

  if (sizes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center text-sm text-muted-foreground">
        최근 36개월 매칭된 매매 거래가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSize(p)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                size === p
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-secondary"
              )}
            >
              {formatPyeong(p)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            평균 <strong className="text-foreground tabular-nums">{overallAvg ? formatManwon(overallAvg, { unit: "auto" }) : "—"}</strong>
          </span>
          <span>·</span>
          <span>
            거래 <strong className="text-foreground tabular-nums">{totalDeals > 0 ? formatCount(totalDeals) : "—"}</strong>
          </span>
        </div>
      </div>
      {points.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground sm:h-[320px] md:h-[360px]">
          선택한 평형의 거래 기록이 없습니다.
        </div>
      ) : (
        <PriceHistoryChart data={chartData} metric="avg" />
      )}
    </div>
  );
}

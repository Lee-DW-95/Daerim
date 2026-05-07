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
  jeonse: PriceHistorySeries[];
  monthly: PriceHistorySeries[];
  monthLabels: string[];
};

type DealMode = "trade" | "jeonse" | "monthly";

const DEAL_MODE_LABEL: Record<DealMode, string> = {
  trade: "매매",
  jeonse: "전세",
  monthly: "월세",
};

const PRICE_LABEL: Record<DealMode, string> = {
  trade: "매매가",
  jeonse: "전세 보증금",
  monthly: "월세 보증금",
};

export function ComplexPriceTrend({
  trade,
  jeonse,
  monthly,
  monthLabels,
}: Props) {
  // 데이터가 있는 거래 유형을 자동으로 첫 모드로 선택 (매매 우선, 없으면 전세, 그 다음 월세)
  const initialMode: DealMode = React.useMemo(() => {
    if (trade.length > 0) return "trade";
    if (jeonse.length > 0) return "jeonse";
    if (monthly.length > 0) return "monthly";
    return "trade";
  }, [trade, jeonse, monthly]);

  const [mode, setMode] = React.useState<DealMode>(initialMode);

  const stats = mode === "trade" ? trade : mode === "jeonse" ? jeonse : monthly;
  const hasData: Record<DealMode, boolean> = {
    trade: trade.length > 0,
    jeonse: jeonse.length > 0,
    monthly: monthly.length > 0,
  };

  const sizes = React.useMemo(() => {
    const set = new Set<number>();
    for (const s of stats) set.add(s.sizePyeong);
    return [...set].sort((a, b) => a - b);
  }, [stats]);

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
    for (const s of stats) {
      if (s.sizePyeong === size) map.set(s.yearMonth, s);
    }
    return monthLabels.map((ym) => {
      const s = map.get(ym);
      // 월세 모드: 차트 라인은 월세(만원/월), 보증금은 tooltip에 같이 표시
      if (mode === "monthly") {
        return {
          yearMonth: ym,
          avgManwon: s?.avgMonthlyRent ?? 0,
          medianManwon: s?.avgMonthlyRent ?? 0,
          count: s?.count ?? 0,
          avgDeposit: s?.avgManwon ?? 0,
        };
      }
      return {
        yearMonth: ym,
        avgManwon: s?.avgManwon ?? 0,
        medianManwon: s?.medianManwon ?? 0,
        count: s?.count ?? 0,
      };
    });
  }, [stats, size, monthLabels, mode]);

  const points = chartData.filter((p) => p.count > 0);
  const totalDeals = points.reduce((sum, p) => sum + p.count, 0);
  const overallAvg =
    totalDeals === 0
      ? 0
      : Math.round(
          points.reduce((s, p) => s + p.avgManwon * p.count, 0) / totalDeals
        );

  // 월세 모드 전용: 평균 보증금 (별도 표시)
  const monthlyDepositAvg = React.useMemo(() => {
    if (mode !== "monthly" || size == null) return 0;
    const filtered = monthly.filter((s) => s.sizePyeong === size);
    const totalCount = filtered.reduce((sum, s) => sum + s.count, 0);
    if (totalCount === 0) return 0;
    return Math.round(
      filtered.reduce((acc, s) => acc + s.avgManwon * s.count, 0) / totalCount
    );
  }, [mode, size, monthly]);

  // 모든 거래 유형 데이터 0건이면 안내만
  const totalAcrossModes = trade.length + jeonse.length + monthly.length;
  if (totalAcrossModes === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center text-sm text-muted-foreground">
        최근 36개월 매칭된 거래가 없습니다. 매물 등록 시 단지명이 국토부
        실거래가 데이터와 매칭되도록 운영자에게 알려주세요.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-6">
      {/* 거래 유형 토글 */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 p-1">
        <span className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          거래 유형
        </span>
        {(Object.keys(DEAL_MODE_LABEL) as DealMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => hasData[m] && setMode(m)}
            disabled={!hasData[m]}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium transition-colors",
              mode === m
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
              !hasData[m] && "cursor-not-allowed opacity-50 hover:text-muted-foreground"
            )}
            title={hasData[m] ? undefined : "데이터 없음"}
          >
            {DEAL_MODE_LABEL[m]}
            {!hasData[m] && (
              <span className="ml-1 text-[10px]">·없음</span>
            )}
          </button>
        ))}
      </div>

      {/* 평형 chip + 요약 */}
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
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {mode === "monthly" ? (
            <>
              <span>
                평균 월세{" "}
                <strong className="text-foreground tabular-nums">
                  {overallAvg
                    ? `${overallAvg.toLocaleString("ko-KR")}만원/월`
                    : "—"}
                </strong>
              </span>
              <span>·</span>
              <span>
                평균 보증금{" "}
                <strong className="text-foreground tabular-nums">
                  {monthlyDepositAvg
                    ? formatManwon(monthlyDepositAvg, { unit: "auto" })
                    : "—"}
                </strong>
              </span>
            </>
          ) : (
            <span>
              평균 {PRICE_LABEL[mode]}{" "}
              <strong className="text-foreground tabular-nums">
                {overallAvg ? formatManwon(overallAvg, { unit: "auto" }) : "—"}
              </strong>
            </span>
          )}
          <span>·</span>
          <span>
            거래{" "}
            <strong className="text-foreground tabular-nums">
              {totalDeals > 0 ? formatCount(totalDeals) : "—"}
            </strong>
          </span>
        </div>
      </div>

      {/* 차트 */}
      {points.length === 0 ? (
        <div
          className="flex w-full items-center justify-center text-sm text-muted-foreground"
          style={{ height: 340 }}
        >
          선택한 평형의 {DEAL_MODE_LABEL[mode]} 거래 기록이 없습니다.
        </div>
      ) : (
        <PriceHistoryChart
          data={chartData}
          metric="avg"
          lineLabel={mode === "monthly" ? "월세" : undefined}
          unitSuffix={mode === "monthly" ? "만원/월" : "만원"}
        />
      )}
    </div>
  );
}

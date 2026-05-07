"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { complexes } from "@/lib/data/complexes";
import { formatManwon, formatCount, formatPyeong } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceHistoryChart } from "@/components/charts/price-history-chart";

import type { ComplexId } from "@/lib/types/complex";

export type PriceHistorySeries = {
  complexId: ComplexId;
  sizePyeong: number;
  yearMonth: string;
  count: number;
  avgManwon: number;
  medianManwon: number;
  minManwon: number;
  maxManwon: number;
};

type Props = {
  /** 매매 통계. */
  trade: PriceHistorySeries[];
  /** 전세 통계. */
  rent: PriceHistorySeries[];
  /** 차트 x축 전체 월 라벨 (데이터가 빈 달도 표시). */
  monthLabels: string[];
};

type DealKind = "trade" | "rent";
type Metric = "avg" | "median";

export function PriceHistoryTool({ trade, rent, monthLabels }: Props) {
  const availableComplexes = React.useMemo(() => {
    const ids = new Set<ComplexId>();
    [...trade, ...rent].forEach((s) => ids.add(s.complexId));
    return complexes.filter((c) => ids.has(c.id));
  }, [trade, rent]);

  const [kind, setKind] = React.useState<DealKind>("trade");
  const [metric, setMetric] = React.useState<Metric>("avg");
  const [complexId, setComplexId] = React.useState<ComplexId | null>(
    availableComplexes[0]?.id ?? null
  );

  const stats = kind === "trade" ? trade : rent;

  const sizesForComplex = React.useMemo(() => {
    if (!complexId) return [];
    const set = new Set<number>();
    stats
      .filter((s) => s.complexId === complexId)
      .forEach((s) => set.add(s.sizePyeong));
    return [...set].sort((a, b) => a - b);
  }, [stats, complexId]);

  const [sizePyeong, setSizePyeong] = React.useState<number | null>(
    sizesForComplex[0] ?? null
  );

  // 단지나 거래 종류가 바뀌면 평형 선택을 첫 번째로 자동 보정.
  React.useEffect(() => {
    if (sizesForComplex.length === 0) {
      setSizePyeong(null);
      return;
    }
    if (sizePyeong == null || !sizesForComplex.includes(sizePyeong)) {
      setSizePyeong(sizesForComplex[0]);
    }
  }, [sizesForComplex, sizePyeong]);

  const chartData = React.useMemo(() => {
    if (!complexId || sizePyeong == null) return [];
    const map = new Map<string, PriceHistorySeries>();
    for (const s of stats) {
      if (s.complexId === complexId && s.sizePyeong === sizePyeong) {
        map.set(s.yearMonth, s);
      }
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
  }, [stats, complexId, sizePyeong, monthLabels]);

  const currentSeriesPoints = chartData.filter((p) => p.count > 0);
  const totalDeals = currentSeriesPoints.reduce((sum, p) => sum + p.count, 0);
  const overallAvg =
    currentSeriesPoints.length === 0
      ? 0
      : Math.round(
          currentSeriesPoints.reduce((sum, p) => sum + p.avgManwon * p.count, 0) /
            totalDeals
        );

  if (availableComplexes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center text-sm text-muted-foreground">
        지웰시티 단지에 매칭된 거래가 아직 없습니다. 다음 빌드 시 다시
        시도됩니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup
          label="거래 유형"
          options={[
            { value: "trade", label: "매매" },
            { value: "rent", label: "전세" },
          ]}
          value={kind}
          onChange={(v) => setKind(v as DealKind)}
        />
        <ToggleGroup
          label="가격 기준"
          options={[
            { value: "avg", label: "평균" },
            { value: "median", label: "중위값" },
          ]}
          value={metric}
          onChange={(v) => setMetric(v as Metric)}
        />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          단지
        </p>
        <div className="flex flex-wrap gap-2">
          {availableComplexes.map((c) => (
            <Button
              key={c.id}
              size="sm"
              variant={complexId === c.id ? "default" : "outline"}
              onClick={() => setComplexId(c.id)}
            >
              {c.shortName} · {c.name}
            </Button>
          ))}
        </div>
      </div>

      {sizesForComplex.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            평형
          </p>
          <div className="flex flex-wrap gap-2">
            {sizesForComplex.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSizePyeong(p)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                  sizePyeong === p
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-secondary"
                )}
              >
                {formatPyeong(p)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="총 거래"
          value={
            currentSeriesPoints.length === 0
              ? "—"
              : formatCount(totalDeals)
          }
          hint={`${monthLabels.length}개월`}
        />
        <StatCard
          label={
            kind === "trade"
              ? metric === "avg"
                ? "평균 매매가"
                : "중위 매매가"
              : metric === "avg"
                ? "평균 보증금"
                : "중위 보증금"
          }
          value={overallAvg ? formatManwon(overallAvg, { unit: "auto" }) : "—"}
        />
        <StatCard
          label="최고가"
          value={
            currentSeriesPoints.length === 0
              ? "—"
              : formatManwon(
                  Math.max(
                    ...currentSeriesPoints.map((p) =>
                      metric === "avg" ? p.avgManwon : p.medianManwon
                    )
                  ),
                  { unit: "auto" }
                )
          }
        />
        <StatCard
          label="최저가"
          value={
            currentSeriesPoints.length === 0
              ? "—"
              : formatManwon(
                  Math.min(
                    ...currentSeriesPoints.map((p) =>
                      metric === "avg" ? p.avgManwon : p.medianManwon
                    )
                  ),
                  { unit: "auto" }
                )
          }
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        {currentSeriesPoints.length === 0 ? (
          <div className="flex h-[360px] items-center justify-center text-sm text-muted-foreground">
            선택한 단지·평형의 거래 기록이 없습니다.
          </div>
        ) : (
          <PriceHistoryChart data={chartData} metric={metric} />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">데이터 출처: 국토교통부 실거래가 OpenAPI</Badge>
        <span>· 1일 1회 자동 갱신</span>
        <span>
          · 평균은 단지·평형 그룹 내 단순 평균이며, 거래 표본이 적은 달은 변동성이 큽니다.
        </span>
      </div>
    </div>
  );
}

function ToggleGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 p-1">
      <span className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-colors",
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums md:text-xl">
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 text-xs text-muted-foreground/80">{hint}</p>
      )}
    </div>
  );
}

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { complexes } from "@/lib/data/complexes";
import { formatManwon, formatCount, formatPyeong } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceHistoryChart } from "@/components/charts/price-history-chart";

import type { ComplexId } from "@/lib/types/complex";

export type OfficetelSeries = {
  complexId: ComplexId;
  sizePyeong: number;
  yearMonth: string;
  count: number;
  /** 전세: 보증금 평균 (만원) / 월세: 보증금 평균 (만원). */
  avgManwon: number;
  medianManwon: number;
  /** 월세 평균 (만원). 월세 거래에서만 의미. */
  avgMonthlyRent?: number;
};

type Props = {
  /** 전세 통계 (월세=0). */
  jeonse: OfficetelSeries[];
  /** 월세 통계 (월세>0). */
  monthly: OfficetelSeries[];
  monthLabels: string[];
};

type Mode = "jeonse" | "monthly";

export function OfficetelPriceHistoryTool({ jeonse, monthly, monthLabels }: Props) {
  const availableComplexes = React.useMemo(() => {
    const ids = new Set<ComplexId>();
    [...jeonse, ...monthly].forEach((s) => ids.add(s.complexId));
    return complexes.filter((c) => ids.has(c.id));
  }, [jeonse, monthly]);

  const [mode, setMode] = React.useState<Mode>("jeonse");
  const [complexId, setComplexId] = React.useState<ComplexId | null>(
    availableComplexes[0]?.id ?? null
  );

  const stats = mode === "jeonse" ? jeonse : monthly;

  const sizesForComplex = React.useMemo(() => {
    if (!complexId) return [];
    const set = new Set<number>();
    stats
      .filter((s) => s.complexId === complexId)
      .forEach((s) => set.add(s.sizePyeong));
    return [...set].sort((a, b) => a - b);
  }, [stats, complexId]);

  const [sizePyeong, setSizePyeong] = React.useState<number | null>(null);

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
    const map = new Map<string, OfficetelSeries>();
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

  const points = chartData.filter((p) => p.count > 0);
  const totalDeals = points.reduce((sum, p) => sum + p.count, 0);
  const overallAvg =
    totalDeals === 0
      ? 0
      : Math.round(
          points.reduce((s, p) => s + p.avgManwon * p.count, 0) / totalDeals
        );

  // 월세 거래 평균 월세
  const monthlyRentAvg = React.useMemo(() => {
    if (mode !== "monthly" || !complexId || sizePyeong == null) return 0;
    const filtered = monthly.filter(
      (s) => s.complexId === complexId && s.sizePyeong === sizePyeong
    );
    const totalCount = filtered.reduce((sum, s) => sum + s.count, 0);
    if (totalCount === 0) return 0;
    const sum = filtered.reduce(
      (acc, s) => acc + (s.avgMonthlyRent ?? 0) * s.count,
      0
    );
    return Math.round(sum / totalCount);
  }, [mode, complexId, sizePyeong, monthly]);

  if (availableComplexes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center text-sm text-muted-foreground">
        매칭된 오피스텔 거래가 아직 없습니다. 매칭 패턴을 추가하시려면 운영자에게
        알려주세요.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup
          label="거래 유형"
          options={[
            { value: "jeonse", label: "전세 (보증금)" },
            { value: "monthly", label: "월세 (보증금+월세)" },
          ]}
          value={mode}
          onChange={(v) => setMode(v as Mode)}
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
          value={points.length === 0 ? "—" : formatCount(totalDeals)}
          hint={`${monthLabels.length}개월`}
        />
        <StatCard
          label={mode === "jeonse" ? "평균 보증금" : "평균 보증금"}
          value={overallAvg ? formatManwon(overallAvg, { unit: "auto" }) : "—"}
        />
        <StatCard
          label={mode === "jeonse" ? "최고 보증금" : "최고 보증금"}
          value={
            points.length === 0
              ? "—"
              : formatManwon(Math.max(...points.map((p) => p.avgManwon)), {
                  unit: "auto",
                })
          }
        />
        <StatCard
          label={mode === "jeonse" ? "최저 보증금" : "평균 월세"}
          value={
            mode === "monthly"
              ? monthlyRentAvg
                ? `${monthlyRentAvg.toLocaleString("ko-KR")}만원/월`
                : "—"
              : points.length === 0
                ? "—"
                : formatManwon(Math.min(...points.map((p) => p.avgManwon)), {
                    unit: "auto",
                  })
          }
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        {points.length === 0 ? (
          <div
            className="flex w-full items-center justify-center text-sm text-muted-foreground"
            style={{ height: 340 }}
          >
            선택한 단지·평형의 거래 기록이 없습니다.
          </div>
        ) : (
          <PriceHistoryChart data={chartData} metric="avg" />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">데이터 출처: 국토교통부 오피스텔 전월세 OpenAPI</Badge>
        <span>· 1일 1회 자동 갱신</span>
        <span>
          · 평형은 전용면적 기준 한국식 평수(반올림). 오피스텔 평형은 일반적으로
          작아서 매칭 신뢰도가 단지마다 다를 수 있습니다.
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

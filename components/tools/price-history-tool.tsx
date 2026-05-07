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
  /** 월세 거래에서만: 평균 월세 (만원). */
  avgMonthlyRent?: number;
};

type Props = {
  /** 매매 통계 (아파트). */
  trade: PriceHistorySeries[];
  /** 전세 통계 (아파트 + 오피스텔, monthlyRent === 0). */
  jeonse: PriceHistorySeries[];
  /** 월세 통계 (아파트 + 오피스텔, monthlyRent > 0). */
  monthly: PriceHistorySeries[];
  /** 차트 x축 전체 월 라벨 (데이터가 빈 달도 표시). */
  monthLabels: string[];
};

type DealMode = "trade" | "jeonse" | "monthly";
type Metric = "avg" | "median";

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

export function PriceHistoryTool({ trade, jeonse, monthly, monthLabels }: Props) {
  const [mode, setMode] = React.useState<DealMode>("trade");
  const [metric, setMetric] = React.useState<Metric>("avg");

  const stats = mode === "trade" ? trade : mode === "jeonse" ? jeonse : monthly;

  // 매매는 아파트만, 전월세는 아파트+오피스텔 통합. 모드별로 매칭 단지가 달라짐.
  const dataComplexIds = React.useMemo(() => {
    const set = new Set<ComplexId>();
    for (const s of stats) set.add(s.complexId);
    return set;
  }, [stats]);

  const allComplexes = complexes;

  const [complexId, setComplexId] = React.useState<ComplexId | null>(() => {
    // 첫 진입 시 매칭된 단지 중 하나 자동 선택
    for (const c of allComplexes) {
      if (dataComplexIds.has(c.id)) return c.id;
    }
    return null;
  });

  // 모드 변경 시 현재 단지가 데이터에 없으면 자동 보정
  React.useEffect(() => {
    if (!complexId || !dataComplexIds.has(complexId)) {
      const fallback =
        allComplexes.find((c) => dataComplexIds.has(c.id))?.id ?? null;
      setComplexId(fallback);
    }
  }, [dataComplexIds, complexId, allComplexes]);

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
    const map = new Map<string, PriceHistorySeries>();
    for (const s of stats) {
      if (s.complexId === complexId && s.sizePyeong === sizePyeong) {
        map.set(s.yearMonth, s);
      }
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
  }, [stats, complexId, sizePyeong, monthLabels, mode]);

  const points = chartData.filter((p) => p.count > 0);
  const totalDeals = points.reduce((sum, p) => sum + p.count, 0);
  const overallAvg =
    totalDeals === 0
      ? 0
      : Math.round(
          points.reduce((s, p) => s + p.avgManwon * p.count, 0) / totalDeals
        );

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

  // 월세 모드에서 보여줄 평균 보증금 (별도 카드에 표시)
  const monthlyDepositAvg = React.useMemo(() => {
    if (mode !== "monthly" || !complexId || sizePyeong == null) return 0;
    const filtered = monthly.filter(
      (s) => s.complexId === complexId && s.sizePyeong === sizePyeong
    );
    const totalCount = filtered.reduce((sum, s) => sum + s.count, 0);
    if (totalCount === 0) return 0;
    const sum = filtered.reduce((acc, s) => acc + s.avgManwon * s.count, 0);
    return Math.round(sum / totalCount);
  }, [mode, complexId, sizePyeong, monthly]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup
          label="거래 유형"
          options={[
            { value: "trade", label: "매매" },
            { value: "jeonse", label: "전세" },
            { value: "monthly", label: "월세" },
          ]}
          value={mode}
          onChange={(v) => setMode(v as DealMode)}
        />
        {mode !== "monthly" && (
          <ToggleGroup
            label="가격 기준"
            options={[
              { value: "avg", label: "평균" },
              { value: "median", label: "중위값" },
            ]}
            value={metric}
            onChange={(v) => setMetric(v as Metric)}
          />
        )}
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          단지
        </p>
        <div className="flex flex-wrap gap-2">
          {allComplexes.map((c) => {
            const hasData = dataComplexIds.has(c.id);
            const active = complexId === c.id;
            return (
              <Button
                key={c.id}
                size="sm"
                variant={active ? "default" : "outline"}
                onClick={() => hasData && setComplexId(c.id)}
                disabled={!hasData}
                title={
                  hasData
                    ? undefined
                    : `${DEAL_MODE_LABEL[mode]} 거래 데이터 없음`
                }
              >
                {c.shortName} · {c.name}
                {!hasData && (
                  <span className="ml-1.5 text-[10px] opacity-70">데이터 없음</span>
                )}
              </Button>
            );
          })}
        </div>
        {mode === "trade" && (
          <p className="text-xs text-muted-foreground">
            ※ 오피스텔 매매는 별도 사용신청이 필요해 현재 데이터가 비어있을 수
            있습니다 (전세·월세는 정상).
          </p>
        )}
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
        {mode === "monthly" ? (
          <>
            <StatCard
              label="평균 월세"
              value={
                monthlyRentAvg
                  ? `${monthlyRentAvg.toLocaleString("ko-KR")}만원/월`
                  : "—"
              }
              hint="차트의 라인 값"
            />
            <StatCard
              label="평균 보증금"
              value={
                monthlyDepositAvg
                  ? formatManwon(monthlyDepositAvg, { unit: "auto" })
                  : "—"
              }
            />
            <StatCard
              label="최고 월세"
              value={
                points.length === 0
                  ? "—"
                  : `${Math.max(...points.map((p) => p.avgManwon)).toLocaleString("ko-KR")}만원/월`
              }
            />
          </>
        ) : (
          <>
            <StatCard
              label={metric === "avg" ? `평균 ${PRICE_LABEL[mode]}` : `중위 ${PRICE_LABEL[mode]}`}
              value={overallAvg ? formatManwon(overallAvg, { unit: "auto" }) : "—"}
            />
            <StatCard
              label="최고가"
              value={
                points.length === 0
                  ? "—"
                  : formatManwon(
                      Math.max(
                        ...points.map((p) =>
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
                points.length === 0
                  ? "—"
                  : formatManwon(
                      Math.min(
                        ...points.map((p) =>
                          metric === "avg" ? p.avgManwon : p.medianManwon
                        )
                      ),
                      { unit: "auto" }
                    )
              }
            />
          </>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        {points.length === 0 ? (
          <div
            className="flex w-full items-center justify-center text-sm text-muted-foreground"
            style={{ height: 340 }}
          >
            {complexId == null
              ? `${DEAL_MODE_LABEL[mode]} 거래 데이터가 있는 단지가 없습니다.`
              : "선택한 단지·평형의 거래 기록이 없습니다."}
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

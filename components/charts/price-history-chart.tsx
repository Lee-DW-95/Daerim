"use client";

import * as React from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatManwon, formatYearMonth, formatCount } from "@/lib/format";

type Point = {
  yearMonth: string;
  avgManwon: number;
  medianManwon: number;
  count: number;
  /** 월세 모드 보조 정보: 평균 보증금 (만원). */
  avgDeposit?: number;
};

type Props = {
  data: Point[];
  metric: "avg" | "median";
  /** 라인 색상 (CSS variable로 가능). 기본은 brand navy. */
  lineColor?: string;
  /** 막대 색상. */
  barColor?: string;
  /** 라인 라벨 (tooltip에 표시). 기본 "평균가"/"중위값". */
  lineLabel?: string;
  /** y축 단위 표시 ("만원", "만원/월" 등). 기본 "만원". */
  unitSuffix?: string;
};

export function PriceHistoryChart({
  data,
  metric,
  lineColor = "var(--chart-1)",
  barColor = "var(--chart-2)",
  lineLabel,
  unitSuffix = "만원",
}: Props) {
  const priceKey = metric === "avg" ? "avgManwon" : "medianManwon";
  const computedLineLabel = lineLabel ?? (metric === "avg" ? "평균가" : "중위값");
  const isMonthly = unitSuffix === "만원/월";

  return (
    <div className="w-full" style={{ height: 340 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <ComposedChart
          data={data}
          margin={{ top: 16, right: 24, bottom: 0, left: 0 }}
        >
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="yearMonth"
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickFormatter={formatYearMonth}
            tickMargin={8}
            minTickGap={20}
          />
          <YAxis
            yAxisId="price"
            orientation="left"
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickFormatter={(v: number) =>
              isMonthly
                ? `${v.toLocaleString("ko-KR")}`
                : formatManwon(v, { unit: "auto", decimals: 1 })
            }
            width={70}
          />
          <YAxis
            yAxisId="count"
            orientation="right"
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickFormatter={(v: number) => `${v}건`}
            width={48}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null;
              const point = payload[0]?.payload as Point | undefined;
              if (!point) return null;
              return (
                <div className="rounded-lg border border-border bg-popover px-3 py-2.5 text-xs shadow-lg">
                  <p className="mb-1.5 font-semibold text-foreground">
                    {formatYearMonth(String(label ?? ""))}
                  </p>
                  <dl className="space-y-1 tabular-nums">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="flex items-center gap-1.5 text-muted-foreground">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: lineColor }}
                        />
                        {computedLineLabel}
                      </dt>
                      <dd className="font-semibold text-foreground">
                        {isMonthly
                          ? `${point[priceKey].toLocaleString("ko-KR")}만원/월`
                          : formatManwon(point[priceKey], { unit: "auto" })}
                      </dd>
                    </div>
                    {isMonthly && point.avgDeposit != null && point.avgDeposit > 0 && (
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-muted-foreground">보증금</dt>
                        <dd className="font-medium text-foreground">
                          {formatManwon(point.avgDeposit, { unit: "auto" })}
                        </dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4">
                      <dt className="flex items-center gap-1.5 text-muted-foreground">
                        <span
                          className="h-2 w-2 rounded-sm"
                          style={{ background: barColor, opacity: 0.5 }}
                        />
                        거래 건수
                      </dt>
                      <dd className="font-medium text-foreground">
                        {formatCount(point.count)}
                      </dd>
                    </div>
                  </dl>
                </div>
              );
            }}
          />
          <Legend
            verticalAlign="top"
            height={28}
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar
            yAxisId="count"
            dataKey="count"
            name="거래 건수"
            fill={barColor}
            opacity={0.35}
            barSize={16}
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey={priceKey}
            name={computedLineLabel}
            stroke={lineColor}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

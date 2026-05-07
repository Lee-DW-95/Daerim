"use client";

import * as React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ComplexId } from "@/lib/types/complex";
import { formatManwon, formatYearMonth } from "@/lib/format";

const SERIES_COLOR_TOKENS: Record<ComplexId, string> = {
  "jiwell-1": "var(--chart-1)",
  "jiwell-2": "var(--chart-2)",
  "jiwell-3": "var(--chart-4)",
  "lotte-officetel": "var(--chart-3)",
};

export type MultiSeriesPoint = Record<string, number | string> & {
  yearMonth: string;
};

type Props = {
  /** x축에 표시할 월 라벨 (YYYY-MM, 과거→현재). */
  monthLabels: string[];
  /** 단지별 시리즈. key는 ComplexId, value는 yearMonth → manwon 매핑. */
  series: Array<{
    complexId: ComplexId;
    label: string;
    points: Map<string, number>;
  }>;
};

export function MultiComplexChart({ monthLabels, series }: Props) {
  const data: MultiSeriesPoint[] = React.useMemo(() => {
    return monthLabels.map((ym) => {
      const row: MultiSeriesPoint = { yearMonth: ym };
      for (const s of series) {
        const v = s.points.get(ym);
        if (v != null && v > 0) row[s.complexId] = v;
      }
      return row;
    });
  }, [monthLabels, series]);

  return (
    <div className="w-full" style={{ height: 360 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <LineChart data={data} margin={{ top: 16, right: 24, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="yearMonth"
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickFormatter={formatYearMonth}
            tickMargin={8}
            minTickGap={20}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickFormatter={(v: number) =>
              formatManwon(v, { unit: "auto", decimals: 1 })
            }
            width={70}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--popover-foreground)",
            }}
            labelFormatter={(label) => formatYearMonth(String(label ?? ""))}
            formatter={(value, name) => {
              const v = Number(value);
              const s = series.find((x) => x.complexId === name);
              return [formatManwon(v, { unit: "auto" }), s?.label ?? name];
            }}
          />
          <Legend
            verticalAlign="top"
            height={28}
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => {
              const s = series.find((x) => x.complexId === value);
              return s?.label ?? value;
            }}
          />
          {series.map((s) => (
            <Line
              key={s.complexId}
              type="monotone"
              dataKey={s.complexId}
              name={s.complexId}
              stroke={SERIES_COLOR_TOKENS[s.complexId] ?? "var(--chart-1)"}
              strokeWidth={2.5}
              dot={{ r: 2.5 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

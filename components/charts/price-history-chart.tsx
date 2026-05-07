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
};

type Props = {
  data: Point[];
  metric: "avg" | "median";
  /** 라인 색상 (CSS variable로 가능). 기본은 brand navy. */
  lineColor?: string;
  /** 막대 색상. */
  barColor?: string;
};

export function PriceHistoryChart({
  data,
  metric,
  lineColor = "var(--chart-1)",
  barColor = "var(--chart-2)",
}: Props) {
  const priceKey = metric === "avg" ? "avgManwon" : "medianManwon";

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
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
            tickFormatter={(v: number) => formatManwon(v, { unit: "auto", decimals: 1 })}
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
              if (name === "거래 건수") return [formatCount(v), name];
              return [formatManwon(v, { unit: "auto" }), name];
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
            name={metric === "avg" ? "평균가" : "중위값"}
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

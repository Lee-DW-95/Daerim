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

import { formatManwon } from "@/lib/format";
import { SCENARIO_LABEL } from "@/lib/simulator";

import type { ScenarioYearPoint } from "@/lib/simulator";

type Props = {
  data: ScenarioYearPoint[];
};

const COLORS = {
  trade: "var(--chart-1)",
  jeonse: "var(--chart-3)",
  rent: "var(--chart-4)",
} as const;

export function RentVsBuyChart({ data }: Props) {
  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 24, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickFormatter={(v: number) => `${v}년`}
            tickMargin={8}
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
            labelFormatter={(label) => `${label}년차`}
            formatter={(value, name) => {
              const v = Number(value);
              const key = name as keyof typeof SCENARIO_LABEL;
              return [formatManwon(v, { unit: "auto" }), SCENARIO_LABEL[key] ?? name];
            }}
          />
          <Legend
            verticalAlign="top"
            height={28}
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => {
              const key = value as keyof typeof SCENARIO_LABEL;
              return SCENARIO_LABEL[key] ?? value;
            }}
          />
          <Line
            type="monotone"
            dataKey="trade"
            stroke={COLORS.trade}
            strokeWidth={2.5}
            dot={{ r: 2.5 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="jeonse"
            stroke={COLORS.jeonse}
            strokeWidth={2.5}
            strokeDasharray="6 3"
            dot={{ r: 2.5 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="rent"
            stroke={COLORS.rent}
            strokeWidth={2.5}
            strokeDasharray="2 3"
            dot={{ r: 2.5 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

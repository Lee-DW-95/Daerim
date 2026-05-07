"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { complexes } from "@/lib/data/complexes";
import { formatManwon, formatPyeong, formatCount } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { MultiComplexChart } from "@/components/charts/multi-complex-chart";

import type { ComplexId, Complex } from "@/lib/types/complex";
import type { PriceHistorySeries } from "@/components/tools/price-history-tool";

type Props = {
  trade: PriceHistorySeries[];
  monthLabels: string[];
};

export function CompareTool({ trade, monthLabels }: Props) {
  const dataComplexIds = React.useMemo(() => {
    const set = new Set<ComplexId>();
    for (const s of trade) set.add(s.complexId);
    return set;
  }, [trade]);

  // 데이터가 있는 단지 + 데이터 없는 단지 모두 비교 표에는 노출.
  const allComplexes = complexes;

  const [selectedIds, setSelectedIds] = React.useState<Set<ComplexId>>(
    () => new Set(complexes.filter((c) => dataComplexIds.has(c.id)).map((c) => c.id))
  );

  const sizesAvailable = React.useMemo(() => {
    const set = new Set<number>();
    for (const s of trade) {
      if (selectedIds.has(s.complexId)) set.add(s.sizePyeong);
    }
    return [...set].sort((a, b) => a - b);
  }, [trade, selectedIds]);

  const [sizePyeong, setSizePyeong] = React.useState<number | null>(
    sizesAvailable[0] ?? null
  );

  React.useEffect(() => {
    if (sizesAvailable.length === 0) {
      setSizePyeong(null);
      return;
    }
    if (sizePyeong == null || !sizesAvailable.includes(sizePyeong)) {
      setSizePyeong(sizesAvailable[0]);
    }
  }, [sizesAvailable, sizePyeong]);

  const toggleComplex = (id: ComplexId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const series = React.useMemo(() => {
    if (sizePyeong == null) return [];
    return [...selectedIds]
      .map((id) => {
        const c = complexes.find((x) => x.id === id);
        if (!c) return null;
        const points = new Map<string, number>();
        for (const s of trade) {
          if (s.complexId === id && s.sizePyeong === sizePyeong) {
            points.set(s.yearMonth, s.avgManwon);
          }
        }
        return { complexId: id, label: `${c.shortName} ${formatPyeong(sizePyeong)}`, points };
      })
      .filter((x): x is { complexId: ComplexId; label: string; points: Map<string, number> } =>
        x != null
      );
  }, [selectedIds, sizePyeong, trade]);

  const summaryByComplex = React.useMemo(() => {
    if (sizePyeong == null) return [];
    return [...selectedIds].map((id) => {
      const points = trade.filter(
        (s) => s.complexId === id && s.sizePyeong === sizePyeong
      );
      const totalCount = points.reduce((sum, p) => sum + p.count, 0);
      const overallAvg =
        totalCount === 0
          ? 0
          : Math.round(
              points.reduce((sum, p) => sum + p.avgManwon * p.count, 0) /
                totalCount
            );
      const recentPoint = points
        .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth))
        .at(-1);
      return {
        complexId: id,
        totalCount,
        overallAvg,
        recentMonth: recentPoint?.yearMonth ?? null,
        recentAvg: recentPoint?.avgManwon ?? 0,
      };
    });
  }, [selectedIds, sizePyeong, trade]);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          단지 선택
        </p>
        <div className="flex flex-wrap gap-2">
          {allComplexes.map((c) => {
            const isSelected = selectedIds.has(c.id);
            const hasData = dataComplexIds.has(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleComplex(c.id)}
                disabled={!hasData}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-secondary",
                  !hasData && "opacity-50 cursor-not-allowed"
                )}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: complexColor(c.id),
                  }}
                />
                {c.shortName} · {c.name}
                {!hasData && (
                  <span className="text-xs font-normal opacity-70">데이터 부족</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {sizesAvailable.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            평형
          </p>
          <div className="flex flex-wrap gap-2">
            {sizesAvailable.map((p) => (
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

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold tracking-tight md:text-xl">
            평균 매매가 추이
          </h2>
          {sizePyeong != null && (
            <Badge variant="outline">
              {formatPyeong(sizePyeong)} · 최근 {monthLabels.length}개월
            </Badge>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4 md:p-6">
          {series.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground sm:h-[340px] md:h-[380px]">
              비교할 단지를 선택해주세요.
            </div>
          ) : (
            <MultiComplexChart monthLabels={monthLabels} series={series} />
          )}
        </div>
      </section>

      {sizePyeong != null && summaryByComplex.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight md:text-xl">
            평형별 시세 요약
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {summaryByComplex.map(
              ({ complexId, totalCount, overallAvg, recentMonth, recentAvg }) => {
                const c = complexes.find((x) => x.id === complexId);
                if (!c) return null;
                return (
                  <div
                    key={complexId}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: complexColor(complexId) }}
                      />
                      <p className="text-sm font-semibold">{c.shortName}</p>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">평균 매매가</p>
                    <p className="text-xl font-bold tabular-nums">
                      {overallAvg
                        ? formatManwon(overallAvg, { unit: "auto" })
                        : "—"}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">총 거래</p>
                        <p className="font-medium tabular-nums">
                          {totalCount > 0 ? formatCount(totalCount) : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">최근 평균</p>
                        <p className="font-medium tabular-nums">
                          {recentMonth && recentAvg
                            ? `${formatManwon(recentAvg, { unit: "auto" })} (${recentMonth.slice(2).replace("-", ".")})`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight md:text-xl">
          단지 정보 비교
        </h2>
        <ComplexInfoTable
          complexes={allComplexes.filter((c) => selectedIds.has(c.id))}
        />
      </section>
    </div>
  );
}

function complexColor(id: ComplexId): string {
  switch (id) {
    case "jiwell-1":
      return "var(--chart-1)";
    case "jiwell-2":
      return "var(--chart-2)";
    case "jiwell-3":
      return "var(--chart-4)";
    case "lotte-officetel":
      return "var(--chart-3)";
    default:
      return "var(--chart-1)";
  }
}

function fmtNum(n: number | null | undefined, suffix = ""): string {
  if (n == null) return "정보 미공개";
  return `${n.toLocaleString("ko-KR")}${suffix}`;
}

function ComplexInfoTable({ complexes: list }: { complexes: Complex[] }) {
  if (list.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-8 text-center text-sm text-muted-foreground">
        비교할 단지를 선택해주세요.
      </div>
    );
  }

  const rows: Array<{
    label: string;
    render: (c: Complex) => React.ReactNode;
  }> = [
    { label: "유형", render: (c) => c.type },
    { label: "입주연도", render: (c) => fmtNum(c.buildYear) },
    { label: "세대수", render: (c) => fmtNum(c.households, "세대") },
    { label: "동수", render: (c) => fmtNum(c.buildings, "동") },
    { label: "최고 층수", render: (c) => fmtNum(c.maxFloor, "층") },
    { label: "용적률", render: (c) => fmtNum(c.floorAreaRatio, "%") },
    { label: "건폐율", render: (c) => fmtNum(c.buildingCoverageRatio, "%") },
    {
      label: "주차",
      render: (c) =>
        c.parkingPerHousehold != null
          ? `${c.parkingPerHousehold} / 세대당`
          : c.parkingTotal != null
            ? fmtNum(c.parkingTotal, "대")
            : "정보 미공개",
    },
    {
      label: "평형",
      render: (c) =>
        c.sizes.length > 0 ? c.sizes.map((s) => `${s}평`).join(" · ") : "정보 미공개",
    },
    {
      label: "초등학교",
      render: (c) =>
        c.schools?.elementary?.length ? c.schools.elementary.join(", ") : "—",
    },
    {
      label: "중학교",
      render: (c) =>
        c.schools?.middle?.length ? c.schools.middle.join(", ") : "—",
    },
    {
      label: "고등학교",
      render: (c) =>
        c.schools?.high?.length ? c.schools.high.join(", ") : "—",
    },
    {
      label: "지웰시티몰 (도보)",
      render: (c) => fmtNum(c.amenities?.jiwellMallWalkMin, "분"),
    },
    {
      label: "현대백화점 (도보)",
      render: (c) => fmtNum(c.amenities?.hyundaiDeptWalkMin, "분"),
    },
    {
      label: "SK하이닉스 (차량)",
      render: (c) => fmtNum(c.transport?.hynixCarMin, "분"),
    },
    {
      label: "서청주IC (차량)",
      render: (c) => fmtNum(c.transport?.seocheongjuIcCarMin, "분"),
    },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-secondary/40">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              항목
            </th>
            {list.map((c) => (
              <th
                key={c.id}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: complexColor(c.id) }}
                  />
                  {c.shortName}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="px-4 py-3 text-xs font-medium text-muted-foreground">
                {row.label}
              </td>
              {list.map((c) => (
                <td
                  key={c.id}
                  className="px-4 py-3 text-sm tabular-nums"
                >
                  {row.render(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

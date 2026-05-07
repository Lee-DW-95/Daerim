import type { Metadata } from "next";

import {
  fetchDealsRange,
  iterateYearMonth,
  recentMonths,
  LAWD_CD,
  type AptDeal,
} from "@/lib/molit-api";
import { OfficetelPriceHistoryTool } from "@/components/tools/officetel-price-history-tool";

import type { ComplexId } from "@/lib/types/complex";
import type { OfficetelSeries } from "@/components/tools/officetel-price-history-tool";

export const metadata: Metadata = {
  title: "오피스텔 전월세 추이",
  description:
    "청주 흥덕구 오피스텔 전월세 실거래 추이. 대농지구 롯데캐슬시티 등 단지·평형별 보증금·월세 흐름을 데이터로.",
};

export const revalidate = 86400;

const MONTHS_OF_HISTORY = 36;

type Bucket = {
  complexId: ComplexId;
  sizePyeong: number;
  yearMonth: string;
  deposits: number[];
  monthlyRents: number[];
};

function aggregate(
  deals: AptDeal[],
  filter: (d: AptDeal) => boolean
): OfficetelSeries[] {
  const buckets = new Map<string, Bucket>();
  for (const d of deals) {
    if (!d.complexId) continue;
    if (!filter(d)) continue;
    const key = `${d.complexId}|${d.sizePyeong}|${d.dealYearMonth}`;
    const cur = buckets.get(key) ?? {
      complexId: d.complexId,
      sizePyeong: d.sizePyeong,
      yearMonth: d.dealYearMonth,
      deposits: [],
      monthlyRents: [],
    };
    if (d.amountManwon > 0) cur.deposits.push(d.amountManwon);
    if (d.monthlyRentManwon > 0) cur.monthlyRents.push(d.monthlyRentManwon);
    buckets.set(key, cur);
  }

  const out: OfficetelSeries[] = [];
  for (const b of buckets.values()) {
    if (b.deposits.length === 0) continue;
    const sorted = [...b.deposits].sort((a, b) => a - b);
    const sum = sorted.reduce((s, n) => s + n, 0);
    const median =
      sorted.length % 2 === 0
        ? Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2)
        : sorted[(sorted.length - 1) / 2];
    const monthlyAvg =
      b.monthlyRents.length === 0
        ? undefined
        : Math.round(
            b.monthlyRents.reduce((s, n) => s + n, 0) / b.monthlyRents.length
          );
    out.push({
      complexId: b.complexId,
      sizePyeong: b.sizePyeong,
      yearMonth: b.yearMonth,
      count: b.deposits.length,
      avgManwon: Math.round(sum / sorted.length),
      medianManwon: median,
      avgMonthlyRent: monthlyAvg,
    });
  }

  return out.sort(
    (a, b) =>
      a.complexId.localeCompare(b.complexId) ||
      a.sizePyeong - b.sizePyeong ||
      a.yearMonth.localeCompare(b.yearMonth)
  );
}

function toLabel(ym: string): string {
  return `${ym.slice(0, 4)}-${ym.slice(4, 6)}`;
}

export default async function OfficetelPriceHistoryPage() {
  const months = recentMonths(MONTHS_OF_HISTORY);
  const fromYm = months[0];
  const toYm = months[months.length - 1];

  const rentRaw = await fetchDealsRange({
    lawdCd: LAWD_CD.cheongjuHeungdeok,
    fromYm,
    toYm,
    target: "offi-rent",
  }).catch((err) => {
    console.warn(
      "[officetel-price-history] 오피스텔 전월세 fetch 실패:",
      err instanceof Error ? err.message : err
    );
    return [] as AptDeal[];
  });

  const matched = rentRaw.filter((d) => d.complexId);
  // 월세 = 0이면 전세, 월세 > 0이면 월세
  const jeonse = aggregate(matched, (d) => d.monthlyRentManwon === 0)
    // raw deals에서 yearMonth는 "YYYY-MM" 그대로 → series 컴포넌트 라벨과 일치하도록 변환 X
    .map((s) => ({ ...s, yearMonth: s.yearMonth }));
  const monthly = aggregate(matched, (d) => d.monthlyRentManwon > 0);

  const monthLabels = Array.from(iterateYearMonth(fromYm, toYm)).map(toLabel);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <header className="mb-8 max-w-2xl space-y-2">
        <p className="text-sm font-medium text-primary">
          TOOLS · OFFICETEL PRICE HISTORY
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          오피스텔 전월세 추이
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
          청주 흥덕구 오피스텔 실거래 데이터. 매칭된 단지(대농지구 롯데캐슬시티
          등)의 전세 보증금·월세를 단지·평형별로 보여드립니다. 1일 1회 자동
          갱신.
        </p>
      </header>

      <OfficetelPriceHistoryTool
        jeonse={jeonse}
        monthly={monthly}
        monthLabels={monthLabels}
      />
    </div>
  );
}

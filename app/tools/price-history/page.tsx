import type { Metadata } from "next";

import {
  fetchDealsRange,
  iterateYearMonth,
  recentMonths,
  LAWD_CD,
  type AptDeal,
} from "@/lib/molit-api";
import { PriceHistoryTool } from "@/components/tools/price-history-tool";

import type { ComplexId } from "@/lib/types/complex";
import type { PriceHistorySeries } from "@/components/tools/price-history-tool";

export const metadata: Metadata = {
  title: "시세 추이",
  description:
    "청주 흥덕구 지웰시티 1·2·3차 + 롯데캐슬시티 등 주요 단지의 매매·전세·월세 추이를 한 화면에서.",
};

export const revalidate = 86400;

const MONTHS_OF_HISTORY = 36;

type Bucket = {
  complexId: ComplexId;
  sizePyeong: number;
  yearMonth: string;
  prices: number[];
  monthlyRents: number[];
};

function aggregate(
  deals: AptDeal[],
  filter: (d: AptDeal) => boolean
): PriceHistorySeries[] {
  const buckets = new Map<string, Bucket>();
  for (const d of deals) {
    if (!d.complexId) continue;
    if (!filter(d)) continue;
    if (d.amountManwon <= 0) continue;
    const key = `${d.complexId}|${d.sizePyeong}|${d.dealYearMonth}`;
    const cur = buckets.get(key) ?? {
      complexId: d.complexId,
      sizePyeong: d.sizePyeong,
      yearMonth: d.dealYearMonth,
      prices: [],
      monthlyRents: [],
    };
    cur.prices.push(d.amountManwon);
    if (d.monthlyRentManwon > 0) cur.monthlyRents.push(d.monthlyRentManwon);
    buckets.set(key, cur);
  }

  const out: PriceHistorySeries[] = [];
  for (const b of buckets.values()) {
    const sorted = [...b.prices].sort((a, b) => a - b);
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
      count: sorted.length,
      avgManwon: Math.round(sum / sorted.length),
      medianManwon: median,
      minManwon: sorted[0],
      maxManwon: sorted[sorted.length - 1],
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

export default async function PriceHistoryPage() {
  const months = recentMonths(MONTHS_OF_HISTORY);
  const fromYm = months[0];
  const toYm = months[months.length - 1];

  // 4종 데이터를 모두 fetch. 매매(아파트), 전월세(아파트+오피스텔).
  const [aptTrade, aptRent, offiTrade, offiRent] = await Promise.all([
    fetchDealsRange({
      lawdCd: LAWD_CD.cheongjuHeungdeok,
      fromYm,
      toYm,
      target: "apt-trade",
    }),
    fetchDealsRange({
      lawdCd: LAWD_CD.cheongjuHeungdeok,
      fromYm,
      toYm,
      target: "apt-rent",
    }).catch((err) => {
      console.warn("[price-history] 아파트 전월세 fetch 실패:", String(err));
      return [] as AptDeal[];
    }),
    fetchDealsRange({
      lawdCd: LAWD_CD.cheongjuHeungdeok,
      fromYm,
      toYm,
      target: "offi-trade",
    }).catch((err) => {
      console.warn("[price-history] 오피스텔 매매 fetch 실패:", String(err));
      return [] as AptDeal[];
    }),
    fetchDealsRange({
      lawdCd: LAWD_CD.cheongjuHeungdeok,
      fromYm,
      toYm,
      target: "offi-rent",
    }).catch((err) => {
      console.warn("[price-history] 오피스텔 전월세 fetch 실패:", String(err));
      return [] as AptDeal[];
    }),
  ]);

  // 매매 = 아파트 매매 + 오피스텔 매매
  const tradeStats = aggregate(
    [...aptTrade, ...offiTrade],
    (d) => !!d.complexId
  );
  // 전세 = 보증금만 (월세 없음)
  const jeonseStats = aggregate(
    [...aptRent, ...offiRent],
    (d) => d.monthlyRentManwon === 0
  );
  // 월세 = 보증금 + 월세
  const monthlyStats = aggregate(
    [...aptRent, ...offiRent],
    (d) => d.monthlyRentManwon > 0
  );

  const monthLabels = Array.from(iterateYearMonth(fromYm, toYm)).map(toLabel);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <header className="mb-8 max-w-2xl space-y-2">
        <p className="text-sm font-medium text-primary">TOOLS · PRICE HISTORY</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          시세 추이
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
          청주 흥덕구 주요 단지의 최근 {MONTHS_OF_HISTORY}개월 매매·전세·월세
          실거래 데이터를 단지·평형별로 보여드립니다. 지웰시티 1·2·3차(아파트)와
          대농지구 롯데캐슬시티(오피스텔) 등 매칭된 단지가 모두 포함됩니다.
        </p>
      </header>

      <PriceHistoryTool
        trade={tradeStats}
        jeonse={jeonseStats}
        monthly={monthlyStats}
        monthLabels={monthLabels}
      />
    </div>
  );
}

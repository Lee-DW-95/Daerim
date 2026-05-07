import type { Metadata } from "next";

import {
  fetchAptTradesRange,
  groupByComplexSizeMonth,
  iterateYearMonth,
  recentMonths,
  LAWD_CD,
  type DealGroupStat,
} from "@/lib/molit-api";
import {
  PriceHistoryTool,
  type PriceHistorySeries,
} from "@/components/tools/price-history-tool";

export const metadata: Metadata = {
  title: "실거래가 추이",
  description:
    "국토교통부 실거래가 데이터로 보는 청주 지웰시티 1·2·3차 평형별 매매·전세 추이.",
};

// 1일 1회 재생성. 빌드 타임에 fetch 캐시되며, 첫 요청 후 24시간 뒤 자동 갱신.
export const revalidate = 86400;

const MONTHS_OF_HISTORY = 36;

function toSeries(stats: DealGroupStat[]): PriceHistorySeries[] {
  return stats.map((s) => ({
    complexId: s.complexId,
    sizePyeong: s.sizePyeong,
    // groupByComplexSizeMonth가 이미 "YYYY-MM" 포맷으로 반환하므로 변환 불필요.
    yearMonth: s.yearMonth,
    count: s.count,
    avgManwon: s.avgManwon,
    medianManwon: s.medianManwon,
    minManwon: s.minManwon,
    maxManwon: s.maxManwon,
  }));
}

export default async function PriceHistoryPage() {
  const months = recentMonths(MONTHS_OF_HISTORY);
  const fromYm = months[0];
  const toYm = months[months.length - 1];

  // 매매는 필수, 전월세는 별도 API 권한이라 키가 미승인 상태면 fallback.
  const tradePromise = fetchAptTradesRange({
    lawdCd: LAWD_CD.cheongjuHeungdeok,
    fromYm,
    toYm,
    kind: "trade",
  });
  const rentPromise = fetchAptTradesRange({
    lawdCd: LAWD_CD.cheongjuHeungdeok,
    fromYm,
    toYm,
    kind: "rent",
  }).catch((err) => {
    console.warn(
      "[price-history] 전월세 API 호출 실패 — 키 권한 또는 엔드포인트 확인 필요:",
      err instanceof Error ? err.message : err
    );
    return [] as Awaited<typeof tradePromise>;
  });
  const [tradeRaw, rentRaw] = await Promise.all([tradePromise, rentPromise]);

  const tradeStats = groupByComplexSizeMonth(
    tradeRaw.filter((d) => d.complexId)
  );
  const rentStats = groupByComplexSizeMonth(rentRaw.filter((d) => d.complexId));

  const monthLabels = Array.from(iterateYearMonth(fromYm, toYm)).map(
    (ym) => `${ym.slice(0, 4)}-${ym.slice(4, 6)}`
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <header className="mb-8 max-w-2xl space-y-2">
        <p className="text-sm font-medium text-primary">TOOLS · PRICE HISTORY</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          지웰시티 실거래가 추이
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
          최근 {MONTHS_OF_HISTORY}개월 청주 흥덕구 매매·전세 실거래 데이터를
          단지·평형별로 그룹화했습니다. 각 단지에 매칭된 거래만 집계됩니다.
        </p>
      </header>

      <PriceHistoryTool
        trade={toSeries(tradeStats)}
        rent={toSeries(rentStats)}
        monthLabels={monthLabels}
      />
    </div>
  );
}

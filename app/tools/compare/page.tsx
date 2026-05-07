import type { Metadata } from "next";

import {
  fetchAptTradesRange,
  groupByComplexSizeMonth,
  iterateYearMonth,
  recentMonths,
  LAWD_CD,
  type DealGroupStat,
} from "@/lib/molit-api";
import { CompareTool } from "@/components/tools/compare-tool";
import { PageHeader } from "@/components/layout/page-header";

import type { PriceHistorySeries } from "@/components/tools/price-history-tool";

export const metadata: Metadata = {
  title: "지웰시티 1·2·3차 비교",
  description:
    "청주 지웰시티 1차, 2차, 3차를 시세·실거래가·단지 정보로 한눈에 비교합니다.",
};

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

export default async function CompareToolPage() {
  const months = recentMonths(MONTHS_OF_HISTORY);
  const fromYm = months[0];
  const toYm = months[months.length - 1];

  const tradeRaw = await fetchAptTradesRange({
    lawdCd: LAWD_CD.cheongjuHeungdeok,
    fromYm,
    toYm,
    kind: "trade",
  });

  const tradeStats = groupByComplexSizeMonth(
    tradeRaw.filter((d) => d.complexId)
  );

  const monthLabels = Array.from(iterateYearMonth(fromYm, toYm)).map(
    (ym) => `${ym.slice(0, 4)}-${ym.slice(4, 6)}`
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <PageHeader
        eyebrow="TOOLS · COMPARE ★"
        title="지웰시티 1·2·3차 비교 대시보드"
        description="단지를 토글하고 평형을 골라 평균 매매가 추이, 시세 요약, 단지 정보까지 한 화면에서 비교하세요. 실거래 데이터는 1일 1회 자동 갱신됩니다."
      />

      <CompareTool trade={toSeries(tradeStats)} monthLabels={monthLabels} />
    </div>
  );
}

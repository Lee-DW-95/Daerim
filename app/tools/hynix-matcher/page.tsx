import type { Metadata } from "next";

import {
  fetchAptTradesRange,
  groupByComplexSizeMonth,
  recentMonths,
  LAWD_CD,
} from "@/lib/molit-api";
import { complexes } from "@/lib/data/complexes";
import { HynixMatcherTool } from "@/components/tools/hynix-matcher-tool";

import type { SizeMarketStat } from "@/lib/matcher";
import type { ComplexId } from "@/lib/types/complex";

export const metadata: Metadata = {
  title: "SK하이닉스 직원 매물 매칭",
  description:
    "직급·가족 구성·예산을 입력하면 청주 지웰시티에서 가장 잘 맞는 단지·평형을 점수 순으로 추천합니다.",
};

export const revalidate = 86400;

const MONTHS_OF_HISTORY = 36;

function aggregateMarketStats(
  groupStats: ReturnType<typeof groupByComplexSizeMonth>
): SizeMarketStat[] {
  // 단지×평형별로 36개월 데이터를 단순 평균 (count weighted).
  const map = new Map<string, { totalAmount: number; totalCount: number }>();
  for (const s of groupStats) {
    const key = `${s.complexId}|${s.sizePyeong}`;
    const cur = map.get(key) ?? { totalAmount: 0, totalCount: 0 };
    cur.totalAmount += s.avgManwon * s.count;
    cur.totalCount += s.count;
    map.set(key, cur);
  }

  return [...map.entries()].map(([key, v]) => {
    const [complexId, sizeStr] = key.split("|");
    return {
      complexId: complexId as ComplexId,
      sizePyeong: Number(sizeStr),
      saleAvgManwon:
        v.totalCount === 0 ? null : Math.round(v.totalAmount / v.totalCount),
      saleCount: v.totalCount,
    };
  });
}

export default async function HynixMatcherPage() {
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
  const marketStats = aggregateMarketStats(tradeStats);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
      <header className="mb-10 max-w-2xl space-y-2">
        <p className="text-sm font-medium text-primary">
          TOOLS · HYNIX MATCHER ★
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          SK하이닉스 직원 매물 매칭
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
          청주 발령으로 막막하시다면 5가지 조건만 알려주세요. 지웰시티 1·2·3차의
          단지·평형 조합을 점수 순으로 정렬해 보여드립니다. 룰 기반 매칭이라
          AI가 임의로 추천하는 게 아니에요.
        </p>
      </header>

      <HynixMatcherTool complexes={complexes} marketStats={marketStats} />
    </div>
  );
}

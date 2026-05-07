/**
 * 전세 vs 월세 vs 매매 시나리오 시뮬레이터.
 *
 * 가정과 단순화:
 * - 모든 금액은 만원 단위.
 * - 매매: 자본금 + 대출로 집 매수, 매년 r%로 시세 상승, 대출 이자는 단리(원금 동결).
 * - 전세: 자본금 전액이 전세 보증금이라고 가정, 보증금은 N년 후 동일하게 회수.
 *   (전세 인상은 무시. 보증금 자체에서 발생하는 이자 또한 0으로 간주.)
 * - 월세: 자본금은 적금/안전 자산에 거치 (savings rate 적용), 월세는 매월 지출.
 * - 비교 단위는 N년 후 "보유 순자산" (만원).
 */

export type SimulatorInput = {
  /** 자본금 (만원). */
  capitalManwon: number;
  /** 대출 가능 금액 (만원). */
  loanManwon: number;
  /** 보유 기간 (년). 1 이상. */
  years: number;
  /** 시세 상승률 (연 %). 음수도 허용. */
  appreciationRatePct: number;
  /** 대출 이자 (연 %). */
  loanRatePct: number;
  /** 월세 (만원/월). */
  monthlyRentManwon: number;
  /** 자본금을 두는 적금/안전 자산 수익률 (연 %). */
  savingsRatePct: number;
};

export type Scenario = "trade" | "jeonse" | "rent";

export type ScenarioYearPoint = {
  year: number;
  trade: number;
  jeonse: number;
  rent: number;
};

export type SimulationResult = {
  /** 0 ~ years까지의 시계열. */
  series: ScenarioYearPoint[];
  /** N년 후 시점의 시나리오별 순자산. */
  finalManwon: Record<Scenario, number>;
  /** 시나리오별 결정에 도움이 되는 한 줄 메모. */
  notes: Record<Scenario, string>;
  /** 1등 시나리오. */
  best: Scenario;
};

function pct(n: number): number {
  return n / 100;
}

function roundManwon(n: number): number {
  return Math.round(n);
}

function tradeNetWealthAt(year: number, input: SimulatorInput): number {
  const homePrice = input.capitalManwon + input.loanManwon;
  const grown = homePrice * Math.pow(1 + pct(input.appreciationRatePct), year);
  // 단리 이자: 매년 loan × i 만큼 비용. 원금은 N년차 일시상환.
  const cumulativeInterest =
    input.loanManwon * pct(input.loanRatePct) * year;
  return grown - input.loanManwon - cumulativeInterest;
}

function jeonseNetWealthAt(year: number, input: SimulatorInput): number {
  // 보증금이 그대로 회수된다고 가정.
  return input.capitalManwon;
}

function rentNetWealthAt(year: number, input: SimulatorInput): number {
  const grownCapital =
    input.capitalManwon * Math.pow(1 + pct(input.savingsRatePct), year);
  const cumulativeRent = input.monthlyRentManwon * 12 * year;
  return grownCapital - cumulativeRent;
}

export function simulate(input: SimulatorInput): SimulationResult {
  const series: ScenarioYearPoint[] = [];
  for (let y = 0; y <= input.years; y++) {
    series.push({
      year: y,
      trade: roundManwon(tradeNetWealthAt(y, input)),
      jeonse: roundManwon(jeonseNetWealthAt(y, input)),
      rent: roundManwon(rentNetWealthAt(y, input)),
    });
  }

  const last = series[series.length - 1];
  const finalManwon: Record<Scenario, number> = {
    trade: last.trade,
    jeonse: last.jeonse,
    rent: last.rent,
  };

  const homePrice = input.capitalManwon + input.loanManwon;
  const grown = homePrice * Math.pow(1 + pct(input.appreciationRatePct), input.years);
  const cumulativeInterest =
    input.loanManwon * pct(input.loanRatePct) * input.years;
  const grownCapital =
    input.capitalManwon * Math.pow(1 + pct(input.savingsRatePct), input.years);
  const cumulativeRent = input.monthlyRentManwon * 12 * input.years;

  const notes: Record<Scenario, string> = {
    trade: `매수가 ${roundManwon(homePrice).toLocaleString("ko-KR")}만원 → ${input.years}년 후 ${roundManwon(grown).toLocaleString("ko-KR")}만원 (이자 누적 ${roundManwon(cumulativeInterest).toLocaleString("ko-KR")}만원)`,
    jeonse: `보증금 ${input.capitalManwon.toLocaleString("ko-KR")}만원 그대로 회수. 보유 기간 동안 시세 상승의 수혜는 없음.`,
    rent: `자본금 ${input.years}년 후 ${roundManwon(grownCapital).toLocaleString("ko-KR")}만원 / 누적 월세 ${roundManwon(cumulativeRent).toLocaleString("ko-KR")}만원`,
  };

  // 1등 시나리오 = N년 후 순자산이 가장 큰 쪽.
  const ranked = (Object.keys(finalManwon) as Scenario[]).sort(
    (a, b) => finalManwon[b] - finalManwon[a]
  );

  return {
    series,
    finalManwon,
    notes,
    best: ranked[0],
  };
}

export const SCENARIO_LABEL: Record<Scenario, string> = {
  trade: "매매",
  jeonse: "전세",
  rent: "월세",
};

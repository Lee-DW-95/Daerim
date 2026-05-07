/**
 * SK하이닉스 직원 매물 매칭 스코어링.
 *
 * 룰 기반: 입력 조건과 단지·평형 메타데이터를 비교해 점수와 근거를 만듭니다.
 * AI 없이도 충분히 의미 있는 추천이 되도록, "왜 이 단지인가"의 근거 문장이
 * 결과에 함께 포함됩니다.
 */

import type { Complex, ComplexId } from "@/lib/types/complex";

export type Rank = "junior" | "associate" | "manager" | "senior" | "executive";

export type Family =
  | "single"
  | "couple"
  | "child1"
  | "child2plus";

export type DealKind = "rent_monthly" | "rent_jeonse" | "trade";

export type Priority =
  | "commute"
  | "school"
  | "department-store"
  | "newness";

export type MatcherInput = {
  rank: Rank;
  family: Family;
  dealKind: DealKind;
  /** 예산 (만원). 매매면 매매 예산, 전세면 보증금 예산, 월세면 월세 예산. */
  budgetManwon: number;
  priorities: Priority[];
};

export type SizeMarketStat = {
  complexId: ComplexId;
  sizePyeong: number;
  /** 평균 매매가 (만원). 데이터가 없으면 null. */
  saleAvgManwon: number | null;
  /** 거래 건수 (표본 신뢰도 표시용). */
  saleCount: number;
};

export type Recommendation = {
  complexId: ComplexId;
  complexName: string;
  shortName: string;
  sizePyeong: number;
  /** 0~100 점수. */
  score: number;
  /** 추천 근거 문장들. */
  reasons: string[];
  /** 우려사항(데이터 미공개 등). */
  cautions: string[];
  /** 매매 평균가 (만원), 또는 추정 전세 보증금. */
  estimatedPriceManwon: number | null;
  /** 거래 건수 (신뢰도). */
  sampleCount: number;
  /** 예산 대비 초과 비율. 0=예산 내, 0.15=15% 초과 등. */
  budgetOverRatio: number;
};

const FAMILY_PYEONG_FIT: Record<Family, [number, number]> = {
  single: [20, 38],
  couple: [33, 49],
  child1: [39, 59],
  child2plus: [49, 77],
};

const RANK_PYEONG_FIT: Record<Rank, [number, number]> = {
  junior: [20, 39],
  associate: [33, 49],
  manager: [39, 59],
  senior: [49, 63],
  executive: [59, 77],
};

const RANK_LABEL: Record<Rank, string> = {
  junior: "신입",
  associate: "대리",
  manager: "과장",
  senior: "차장",
  executive: "부장+",
};

const FAMILY_LABEL: Record<Family, string> = {
  single: "1인 가구",
  couple: "신혼부부",
  child1: "자녀 1명",
  child2plus: "자녀 2명+",
};

const PRIORITY_LABEL: Record<Priority, string> = {
  commute: "출퇴근 시간",
  school: "학군",
  "department-store": "백화점 접근성",
  newness: "신축 여부",
};

/** 전세는 매매가의 약 70%를 추정 보증금으로 사용. */
const JEONSE_RATIO = 0.7;

/** 두 평형 범위가 얼마나 겹치는지 0~1로 반환. */
function overlapScore(
  pyeong: number,
  range: [number, number]
): number {
  const [min, max] = range;
  if (pyeong >= min && pyeong <= max) return 1;
  const distance = pyeong < min ? min - pyeong : pyeong - max;
  // 단지 평형 단위(약 10평) 안에서 부드럽게 감쇠.
  return Math.max(0, 1 - distance / 10);
}

function inBudget(price: number | null, budget: number): {
  fit: number;
  message: string;
  /** 예산 대비 초과 비율. 0 이하면 예산 내. */
  overRatio: number;
} {
  if (price == null) {
    return {
      fit: 0.5,
      message: "시세 데이터 부족 — 운영자 직접 확인 권장",
      overRatio: 0,
    };
  }
  if (price <= budget) {
    const headroom = (budget - price) / budget;
    return {
      fit: 1,
      message:
        headroom > 0.2
          ? `예산 여유 ${Math.round(headroom * 100)}% — 평형 상향도 검토 가능`
          : "예산 내 가능",
      overRatio: 0,
    };
  }
  const over = (price - budget) / budget;
  if (over <= 0.1) {
    return {
      fit: 0.6,
      message: `예산 ${Math.round(over * 100)}% 초과 — 협상·층수 조정으로 가능성 있음`,
      overRatio: over,
    };
  }
  return {
    fit: 0.1,
    message: `예산 ${Math.round(over * 100)}% 초과 — 평형 하향 검토 필요`,
    overRatio: over,
  };
}

function priorityScore(
  complex: Complex,
  priorities: Priority[]
): { score: number; reasons: string[]; cautions: string[] } {
  const reasons: string[] = [];
  const cautions: string[] = [];

  if (priorities.length === 0) {
    return { score: 0.7, reasons: [], cautions: [] };
  }

  let totalWeight = 0;
  let achieved = 0;

  for (const p of priorities) {
    totalWeight += 1;

    if (p === "commute") {
      const t = complex.transport?.hynixCarMin;
      if (t == null) {
        cautions.push("출퇴근 시간 정보 미공개 (단지 메타에 추후 보강)");
        achieved += 0.5;
      } else if (t <= 10) {
        achieved += 1;
        reasons.push(`SK하이닉스까지 차량 ${t}분`);
      } else if (t <= 20) {
        achieved += 0.7;
        reasons.push(`SK하이닉스까지 차량 ${t}분 (중간)`);
      } else {
        achieved += 0.3;
        cautions.push(`SK하이닉스까지 ${t}분 — 출퇴근 거리 부담`);
      }
    }

    if (p === "school") {
      const elem = complex.schools?.elementary?.length ?? 0;
      const mid = complex.schools?.middle?.length ?? 0;
      if (elem + mid >= 4) {
        achieved += 1;
        reasons.push(
          `${complex.schools?.elementary?.join("·")} 등 학군 풍부`
        );
      } else if (elem + mid >= 2) {
        achieved += 0.7;
        reasons.push(
          `${complex.schools?.elementary?.join("·") ?? ""} 학군 양호`
        );
      } else {
        achieved += 0.3;
        cautions.push("학군 정보 보완 필요");
      }
    }

    if (p === "department-store") {
      const t = complex.amenities?.hyundaiDeptWalkMin;
      if (t == null) {
        cautions.push("백화점 접근성 정보 미공개");
        achieved += 0.5;
      } else if (t <= 5) {
        achieved += 1;
        reasons.push(`현대백화점 도보 ${t}분 — 슬리퍼 거리`);
      } else if (t <= 10) {
        achieved += 0.7;
        reasons.push(`현대백화점 도보 ${t}분`);
      } else {
        achieved += 0.4;
      }
    }

    if (p === "newness") {
      if (complex.buildYear == null) {
        cautions.push("입주연도 정보 미공개");
        achieved += 0.5;
      } else {
        const yearsOld = new Date().getFullYear() - complex.buildYear;
        if (yearsOld <= 5) {
          achieved += 1;
          reasons.push(`${complex.buildYear}년 신축 (${yearsOld}년차)`);
        } else if (yearsOld <= 10) {
          achieved += 0.75;
          reasons.push(`${complex.buildYear}년 입주 (${yearsOld}년차)`);
        } else if (yearsOld <= 15) {
          achieved += 0.5;
          reasons.push(`${complex.buildYear}년 입주 (${yearsOld}년차)`);
        } else {
          achieved += 0.3;
          cautions.push(`${yearsOld}년차 — 신축 우선이라면 다른 단지 고려`);
        }
      }
    }
  }

  return {
    score: totalWeight === 0 ? 0.7 : achieved / totalWeight,
    reasons,
    cautions,
  };
}

export function matchInputToLabel(input: MatcherInput): {
  rank: string;
  family: string;
  dealKind: string;
  priorities: string[];
} {
  return {
    rank: RANK_LABEL[input.rank],
    family: FAMILY_LABEL[input.family],
    dealKind:
      input.dealKind === "rent_monthly"
        ? "월세"
        : input.dealKind === "rent_jeonse"
          ? "전세"
          : "매매",
    priorities: input.priorities.map((p) => PRIORITY_LABEL[p]),
  };
}

export function rankRecommendations(params: {
  input: MatcherInput;
  complexes: Complex[];
  marketStats: SizeMarketStat[];
}): Recommendation[] {
  const { input, complexes, marketStats } = params;
  const stats = new Map<string, SizeMarketStat>();
  for (const s of marketStats) {
    stats.set(`${s.complexId}|${s.sizePyeong}`, s);
  }

  const recs: Recommendation[] = [];

  for (const complex of complexes) {
    // 평형 후보: 단지에 정의된 sizes ∪ 실거래 데이터에 있는 sizes
    const sizeSet = new Set<number>(complex.sizes);
    for (const s of marketStats) {
      if (s.complexId === complex.id) sizeSet.add(s.sizePyeong);
    }
    const sizes = [...sizeSet].sort((a, b) => a - b);
    if (sizes.length === 0) continue;

    for (const sizePyeong of sizes) {
      const market = stats.get(`${complex.id}|${sizePyeong}`);
      const saleAvg = market?.saleAvgManwon ?? null;
      const saleCount = market?.saleCount ?? 0;

      // 거래 종류에 따른 추정 가격
      const estimatedPrice =
        input.dealKind === "trade"
          ? saleAvg
          : input.dealKind === "rent_jeonse"
            ? saleAvg != null
              ? Math.round(saleAvg * JEONSE_RATIO)
              : null
            : null; // 월세는 별도 데이터 없음 → 매칭에서 제외 가능

      // 1) 평형 적합도 (가족 + 직급 평균)
      const familyFit = overlapScore(sizePyeong, FAMILY_PYEONG_FIT[input.family]);
      const rankFit = overlapScore(sizePyeong, RANK_PYEONG_FIT[input.rank]);
      const sizeFit = (familyFit + rankFit) / 2;

      // 2) 예산 적합도
      const budget = inBudget(estimatedPrice, input.budgetManwon);

      // 3) 우선순위 매칭
      const prio = priorityScore(complex, input.priorities);

      // 가중치: 평형 35% + 예산 30% + 우선순위 35%
      const score = Math.round(
        (sizeFit * 0.35 + budget.fit * 0.3 + prio.score * 0.35) * 100
      );

      const reasons: string[] = [];
      const cautions: string[] = [...prio.cautions];

      if (familyFit > 0.8) {
        reasons.push(
          `${FAMILY_LABEL[input.family]} 기준 ${sizePyeong}평이 적정`
        );
      } else if (familyFit < 0.4) {
        cautions.push(
          `${sizePyeong}평은 ${FAMILY_LABEL[input.family]}에 다소 ${
            sizePyeong < FAMILY_PYEONG_FIT[input.family][0] ? "작음" : "큼"
          }`
        );
      }

      if (input.dealKind === "rent_monthly") {
        cautions.push("월세 시세는 운영자에게 직접 확인 (실거래 자료 제한)");
      }

      reasons.push(budget.message);
      reasons.push(...prio.reasons);

      if (saleCount === 0 && input.dealKind !== "rent_monthly") {
        cautions.push("최근 36개월 매칭된 매매 거래 없음 — 시세 신뢰도 낮음");
      } else if (saleCount > 0) {
        reasons.push(`최근 36개월 매매 ${saleCount}건 (표본)`);
      }

      recs.push({
        complexId: complex.id,
        complexName: complex.name,
        shortName: complex.shortName,
        sizePyeong,
        score,
        reasons,
        cautions,
        estimatedPriceManwon: estimatedPrice,
        sampleCount: saleCount,
        budgetOverRatio: budget.overRatio,
      });
    }
  }

  return recs.sort((a, b) => b.score - a.score);
}

/**
 * rankRecommendations 결과를 사용자에게 보여줄 때 적용할 필터.
 *
 * - 예산을 30% 이상 초과한 추천은 명백히 가용 범위 밖이므로 제외.
 * - 점수 40 미만은 평형 적합도·우선순위 매칭이 너무 낮아 노이즈로 간주.
 * - 결과 갯수는 입력 조건에 따라 자연스럽게 달라짐 (고정 N개 X).
 */
export function pickRecommendations(
  all: Recommendation[],
  options: { maxOverRatio?: number; minScore?: number; limit?: number } = {}
): Recommendation[] {
  const { maxOverRatio = 0.3, minScore = 40, limit = 12 } = options;
  return all
    .filter((r) => r.budgetOverRatio <= maxOverRatio)
    .filter((r) => r.score >= minScore)
    .slice(0, limit);
}

export const MATCHER_LABELS = {
  rank: RANK_LABEL,
  family: FAMILY_LABEL,
  priority: PRIORITY_LABEL,
} as const;

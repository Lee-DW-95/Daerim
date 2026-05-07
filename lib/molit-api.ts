import { XMLParser } from "fast-xml-parser";

import type { ComplexId } from "@/lib/types/complex";
import { requireServerEnv } from "@/lib/env";

/**
 * 국토교통부 실거래가 OpenAPI 클라이언트.
 *
 * 출처: https://www.data.go.kr/data/15126474/openapi.do
 * 응답은 XML이며, element는 영문(aptNm, dealAmount, excluUseAr 등).
 *
 * 빌드 타임 또는 ISR 컨텍스트에서만 호출하세요. 클라이언트 컴포넌트에서
 * 직접 호출하면 서버 전용 키가 노출됩니다.
 */

export const LAWD_CD = {
  /** 청주시 흥덕구. */
  cheongjuHeungdeok: "43113",
} as const;

const TRADE_ENDPOINT =
  "https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade";

const RENT_ENDPOINT =
  "https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent";

/** 빌드 타임 fetch 캐시 갱신 주기: 1일. */
export const REVALIDATE_SECONDS = 60 * 60 * 24;

export type DealKind = "trade" | "rent";

/** API 응답 raw item을 정규화한 도메인 모델. */
export type AptDeal = {
  /** 거래 종류. */
  kind: DealKind;
  /** API의 aptNm (정식 단지명에 가까움). */
  apartmentName: string;
  /** 매칭된 우리 단지 ID. 매칭 실패 시 null. */
  complexId: ComplexId | null;
  /** 읍면동. 예: "복대동". */
  dong: string;
  jibun: string;
  /** 전용면적 (㎡). */
  exclusiveAreaSqm: number;
  /** 한국식 평수(반올림). 38평/49평/59평 등. */
  sizePyeong: number;
  /** 거래일 (YYYY-MM-DD). */
  dealDate: string;
  /** 거래년/월 (YYYY-MM). 차트용. */
  dealYearMonth: string;
  /** 매매: 거래금액 만원. 전월세에서는 보증금 만원. */
  amountManwon: number;
  /** 전월세 한정: 월세 만원. 매매면 0. */
  monthlyRentManwon: number;
  /** 층. 알 수 없으면 null. */
  floor: number | null;
  /** 건축년도. */
  buildYear: number | null;
  /** "중개거래" / "직거래" 등. */
  dealingGbn: string;
};

/** 단지명 → 우리 ComplexId 매칭. 띄어쓰기·하이픈 무시. */
function normalizeAptName(name: string): string {
  return name.replace(/[\s\-_()·]/g, "").toLowerCase();
}

// 실제 국토부 데이터에서 관측되는 단지명 패턴 (정규화 후):
//   - 신영지웰시티1차, 신영지웰 (약식 표기, 모두 1차로 간주)
//   - 두산위브지웰시티2차
//   - 청주지웰시티푸르지오 (3차)
// 3차 패턴은 1·2차와 겹치지 않도록 "푸르지오" 토큰을 반드시 포함.
const COMPLEX_PATTERNS: Array<{ id: ComplexId; pattern: RegExp }> = [
  { id: "jiwell-3", pattern: /지웰시티?푸르지오|푸르지오지웰시티/ },
  { id: "jiwell-2", pattern: /두산위브지웰(시티)?(2차)?/ },
  { id: "jiwell-1", pattern: /신영지웰(시티)?(1차)?/ },
];

export function matchComplexId(aptNm: string): ComplexId | null {
  const normalized = normalizeAptName(aptNm);
  for (const { id, pattern } of COMPLEX_PATTERNS) {
    if (pattern.test(normalized)) return id;
  }
  return null;
}

/** 전용면적(㎡) → 한국식 평수(반올림). 1평 ≈ 3.3057㎡. */
export function sqmToPyeong(sqm: number): number {
  return Math.round(sqm / 3.3057);
}

/** 거래금액 문자열 ("16,700") → 숫자 (만원). */
function parseAmount(value: unknown): number {
  if (value == null) return 0;
  const cleaned = String(value).replace(/[\s,]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function pad2(n: number | string): string {
  return String(n).padStart(2, "0");
}

const xmlParser = new XMLParser({
  ignoreAttributes: true,
  trimValues: true,
  parseTagValue: false,
  numberParseOptions: { leadingZeros: false, hex: false },
});

type RawTradeItem = {
  aptNm?: string;
  dealAmount?: string;
  dealYear?: string | number;
  dealMonth?: string | number;
  dealDay?: string | number;
  excluUseAr?: string | number;
  floor?: string | number;
  buildYear?: string | number;
  umdNm?: string;
  jibun?: string | number;
  aptDong?: string;
  dealingGbn?: string;
  /** 전월세 전용. */
  deposit?: string;
  monthlyRent?: string;
};

type RawResponse = {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: {
      items?: { item?: RawTradeItem | RawTradeItem[] } | "";
      numOfRows?: string | number;
      pageNo?: string | number;
      totalCount?: string | number;
    };
  };
};

function asArray<T>(v: T | T[] | undefined | null): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

/**
 * endpoint와 kind에 따라 적절한 키를 선택합니다.
 * - 아파트 매매:    MOLIT_API_KEY
 * - 아파트 전월세:  MOLIT_PART_API_KEY (별도 사용신청)
 * - 오피스텔:       MOLIT_OFFICE_API_KEY
 */
function selectApiKey(endpoint: string, kind: DealKind): string {
  if (endpoint.includes("Offi")) return requireServerEnv("molitOfficeApiKey");
  if (kind === "rent") return requireServerEnv("molitPartApiKey");
  return requireServerEnv("molitApiKey");
}

/** 한 달치 한 페이지 fetch + 정규화. */
async function fetchPage(
  endpoint: string,
  kind: DealKind,
  params: { lawdCd: string; ymd: string; pageNo: number; numOfRows: number }
): Promise<{ deals: AptDeal[]; totalCount: number }> {
  const apiKey = selectApiKey(endpoint, kind);
  const url = new URL(endpoint);
  // serviceKey는 URLSearchParams가 인코딩하면 이중 인코딩될 수 있어 직접 인코딩
  // 후 string 으로 붙이는 게 가장 호환성 좋음.
  url.search = new URLSearchParams({
    serviceKey: apiKey,
    LAWD_CD: params.lawdCd,
    DEAL_YMD: params.ymd,
    pageNo: String(params.pageNo),
    numOfRows: String(params.numOfRows),
  }).toString();

  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(
      `MOLIT API ${endpoint} ${params.ymd} HTTP ${res.status}`
    );
  }

  const xml = await res.text();
  const parsed = xmlParser.parse(xml) as RawResponse;

  const resultCode = parsed.response?.header?.resultCode;
  if (resultCode && resultCode !== "000" && resultCode !== "00") {
    throw new Error(
      `MOLIT API error ${resultCode}: ${
        parsed.response?.header?.resultMsg ?? "unknown"
      }`
    );
  }

  const itemsContainer = parsed.response?.body?.items;
  const rawItems: RawTradeItem[] =
    typeof itemsContainer === "string" ? [] : asArray(itemsContainer?.item);
  const totalCount = Number(parsed.response?.body?.totalCount ?? 0);

  const deals: AptDeal[] = rawItems.map((it) => {
    const aptNm = String(it.aptNm ?? "").trim();
    const sqm = Number(it.excluUseAr ?? 0);
    const dealYear = Number(it.dealYear ?? 0);
    const dealMonth = Number(it.dealMonth ?? 0);
    const dealDay = Number(it.dealDay ?? 0);
    const floorRaw = Number(it.floor ?? NaN);
    const buildYearRaw = Number(it.buildYear ?? NaN);
    const isRent = kind === "rent";

    return {
      kind,
      apartmentName: aptNm,
      complexId: matchComplexId(aptNm),
      dong: String(it.umdNm ?? "").trim(),
      jibun: String(it.jibun ?? "").trim(),
      exclusiveAreaSqm: sqm,
      sizePyeong: sqmToPyeong(sqm),
      dealDate: `${dealYear}-${pad2(dealMonth)}-${pad2(dealDay)}`,
      dealYearMonth: `${dealYear}-${pad2(dealMonth)}`,
      amountManwon: parseAmount(isRent ? it.deposit : it.dealAmount),
      monthlyRentManwon: isRent ? parseAmount(it.monthlyRent) : 0,
      floor: Number.isFinite(floorRaw) ? floorRaw : null,
      buildYear: Number.isFinite(buildYearRaw) ? buildYearRaw : null,
      dealingGbn: String(it.dealingGbn ?? "").trim(),
    };
  });

  return { deals, totalCount };
}

async function fetchAllPages(
  endpoint: string,
  kind: DealKind,
  params: { lawdCd: string; ymd: string }
): Promise<AptDeal[]> {
  const PAGE_SIZE = 1000;
  const first = await fetchPage(endpoint, kind, {
    ...params,
    pageNo: 1,
    numOfRows: PAGE_SIZE,
  });

  if (first.totalCount <= PAGE_SIZE) {
    return first.deals;
  }

  const totalPages = Math.ceil(first.totalCount / PAGE_SIZE);
  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      fetchPage(endpoint, kind, {
        ...params,
        pageNo: i + 2,
        numOfRows: PAGE_SIZE,
      }).then((r) => r.deals)
    )
  );

  return [...first.deals, ...rest.flat()];
}

/** 한 달치 매매 거래 전체. */
export function fetchAptTrades(params: {
  lawdCd: string;
  ymd: string;
}): Promise<AptDeal[]> {
  return fetchAllPages(TRADE_ENDPOINT, "trade", params);
}

/** 한 달치 전월세 거래 전체. */
export function fetchAptRents(params: {
  lawdCd: string;
  ymd: string;
}): Promise<AptDeal[]> {
  return fetchAllPages(RENT_ENDPOINT, "rent", params);
}

/** YYYYMM 문자열 generator. fromYm/toYm 포함, 과거→현재 순. */
export function* iterateYearMonth(
  fromYm: string,
  toYm: string
): Generator<string> {
  let [y, m] = [Number(fromYm.slice(0, 4)), Number(fromYm.slice(4, 6))];
  const [endY, endM] = [Number(toYm.slice(0, 4)), Number(toYm.slice(4, 6))];
  while (y < endY || (y === endY && m <= endM)) {
    yield `${y}${pad2(m)}`;
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
}

/** 직전 N개월의 YYYYMM 배열 (현재월 포함, 과거→현재). */
export function recentMonths(months: number, today = new Date()): string[] {
  const list: string[] = [];
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  for (let i = months - 1; i >= 0; i--) {
    const targetMonth = m - i;
    let yy = y;
    let mm = targetMonth;
    while (mm <= 0) {
      mm += 12;
      yy -= 1;
    }
    list.push(`${yy}${pad2(mm)}`);
  }
  return list;
}

/**
 * 여러 달치를 한 번에 가져옵니다. 동시 호출은 외부 API 부담을 줄이기 위해
 * 6개씩 청크 단위로 처리합니다.
 */
export async function fetchAptTradesRange(params: {
  lawdCd: string;
  fromYm: string;
  toYm: string;
  kind?: DealKind;
}): Promise<AptDeal[]> {
  const months = Array.from(iterateYearMonth(params.fromYm, params.toYm));
  const fetcher =
    params.kind === "rent" ? fetchAptRents : fetchAptTrades;

  const out: AptDeal[] = [];
  const CHUNK = 6;
  for (let i = 0; i < months.length; i += CHUNK) {
    const slice = months.slice(i, i + CHUNK);
    const results = await Promise.all(
      slice.map((ymd) => fetcher({ lawdCd: params.lawdCd, ymd }))
    );
    for (const arr of results) out.push(...arr);
  }
  return out;
}

/** 단지×평형×년월 그룹별 통계. */
export type DealGroupStat = {
  complexId: ComplexId;
  sizePyeong: number;
  yearMonth: string;
  count: number;
  avgManwon: number;
  medianManwon: number;
  minManwon: number;
  maxManwon: number;
};

export function groupByComplexSizeMonth(deals: AptDeal[]): DealGroupStat[] {
  const buckets = new Map<string, AptDeal[]>();
  for (const d of deals) {
    if (!d.complexId) continue;
    const key = `${d.complexId}|${d.sizePyeong}|${d.dealYearMonth}`;
    const arr = buckets.get(key) ?? [];
    arr.push(d);
    buckets.set(key, arr);
  }

  const stats: DealGroupStat[] = [];
  for (const [key, arr] of buckets) {
    const [complexId, sizeStr, yearMonth] = key.split("|");
    const amounts = arr
      .map((d) => d.amountManwon)
      .filter((n) => n > 0)
      .sort((a, b) => a - b);
    if (amounts.length === 0) continue;
    const sum = amounts.reduce((s, n) => s + n, 0);
    const avg = Math.round(sum / amounts.length);
    const median =
      amounts.length % 2 === 0
        ? Math.round(
            (amounts[amounts.length / 2 - 1] + amounts[amounts.length / 2]) / 2
          )
        : amounts[(amounts.length - 1) / 2];
    stats.push({
      complexId: complexId as ComplexId,
      sizePyeong: Number(sizeStr),
      yearMonth,
      count: arr.length,
      avgManwon: avg,
      medianManwon: median,
      minManwon: amounts[0],
      maxManwon: amounts[amounts.length - 1],
    });
  }
  return stats.sort(
    (a, b) =>
      a.complexId.localeCompare(b.complexId) ||
      a.sizePyeong - b.sizePyeong ||
      a.yearMonth.localeCompare(b.yearMonth)
  );
}

/** 한 단지의 평형 목록 (실거래 데이터 기준). */
export function getSizesForComplex(
  deals: AptDeal[],
  complexId: ComplexId
): number[] {
  const sizes = new Set<number>();
  for (const d of deals) {
    if (d.complexId === complexId) sizes.add(d.sizePyeong);
  }
  return [...sizes].sort((a, b) => a - b);
}

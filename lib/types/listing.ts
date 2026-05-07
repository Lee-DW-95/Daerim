import type { ComplexId } from "@/lib/types/complex";

export type ListingDealKind = "trade" | "jeonse" | "monthly";

export type ListingStatus = "available" | "pending" | "sold";

export type ListingDirection =
  | "south"
  | "southeast"
  | "southwest"
  | "east"
  | "west"
  | "north";

export const DIRECTION_LABEL: Record<ListingDirection, string> = {
  south: "남향",
  southeast: "남동향",
  southwest: "남서향",
  east: "동향",
  west: "서향",
  north: "북향",
};

export const DEAL_KIND_LABEL: Record<ListingDealKind, string> = {
  trade: "매매",
  jeonse: "전세",
  monthly: "월세",
};

export const STATUS_LABEL: Record<ListingStatus, string> = {
  available: "거래 가능",
  pending: "협상 중",
  sold: "거래 완료",
};

export type Listing = {
  /** URL 슬러그. /listings/[slug]. */
  slug: string;
  /** 단지 ID. data/complexes.json과 매칭. */
  complexId: ComplexId;
  /** 거래 유형. */
  dealKind: ListingDealKind;
  /** 한국식 평수. */
  sizePyeong: number;
  /** 전용면적 (㎡). 선택 사항. */
  exclusiveAreaSqm?: number;
  /** 층 표기 ("12/25" 같은 형식이면 currentFloor=12, totalFloor=25). */
  currentFloor: number;
  totalFloor?: number;
  /** 향. */
  direction: ListingDirection;
  /** 가격 (만원). 매매가 / 전세 보증금 / 월세 보증금. */
  priceManwon: number;
  /** 월세 (만원). monthly에서만 사용. */
  monthlyRentManwon?: number;
  /** 입주 가능일 (YYYY-MM-DD 또는 "즉시"). */
  availableFrom: string;
  status: ListingStatus;
  /** 매물 발행일. 정렬용. */
  publishedAt: string;
  /** 한 줄 요약. */
  headline: string;
  /** 운영자의 솔직한 코멘트 (강점/약점). */
  agentNote: string;
  /** 매물의 강점. */
  pros: string[];
  /** 매물의 약점/주의사항. */
  cons: string[];
  /** 옵션·인테리어·특이 사항. */
  features: string[];
  /** 이미지 경로. public/listings/{slug}/*.jpg 권장. 비어 있으면 placeholder. */
  images: string[];
};

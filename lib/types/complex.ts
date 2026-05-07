/**
 * 청주 지웰시티 단지 메타데이터 타입.
 *
 * PRD 4.2(단지 비교 대시보드)에서 소비할 항목을 모두 정의합니다.
 * Sprint 1에선 운영자가 정확한 수치를 직접 채워야 하므로 대부분 nullable.
 * 값이 채워지지 않은 필드는 비교 대시보드에서 "정보 미공개"로 노출.
 */

export type ComplexType = "주상복합" | "아파트" | "오피스텔";

export type ComplexId =
  | "jiwell-1"
  | "jiwell-2"
  | "jiwell-3"
  | "lotte-officetel";

export type Schools = {
  elementary: string[];
  middle: string[];
  high: string[];
};

/** 평형(한국식 평수)별 통계. */
export type SizeStats = {
  /** 한국식 평수 (전용 + 공용 추정). */
  size: number;
  /** 전용면적(㎡). 향후 정확한 값으로 보정. */
  exclusiveAreaSqm?: number | null;
  /** 매매 평균 시세 (만원). 운영자가 분기별 갱신. */
  saleAvgManwon?: number | null;
  /** 전세 평균 시세 (만원). */
  jeonseAvgManwon?: number | null;
  /** 평균 관리비 (원/월). */
  monthlyManagementFeeKrw?: number | null;
};

export type Transport = {
  /** SK하이닉스 청주캠퍼스까지 차량 분. */
  hynixCarMin?: number | null;
  /** 서청주IC까지 차량 분. */
  seocheongjuIcCarMin?: number | null;
  /** KTX 오송역까지 차량 분. */
  osongCarMin?: number | null;
};

export type Amenities = {
  /** 지웰시티몰까지 도보 분. */
  jiwellMallWalkMin?: number | null;
  /** 현대백화점 충청점까지 도보 분. */
  hyundaiDeptWalkMin?: number | null;
};

export type Complex = {
  id: ComplexId;
  /** 정식 단지명. */
  name: string;
  /** 단지 줄임 표기 (UI/차트용). 예: "1차". */
  shortName: string;
  address: string;
  /** 입주 연도. */
  buildYear: number | null;
  /** 총 세대수. */
  households: number | null;
  /** 동수. */
  buildings?: number | null;
  type: ComplexType;
  /** 최고 층수. */
  maxFloor?: number | null;
  /** 용적률 (%). */
  floorAreaRatio?: number | null;
  /** 건폐율 (%). */
  buildingCoverageRatio?: number | null;
  /** 총 주차대수. */
  parkingTotal?: number | null;
  /** 세대당 주차대수. */
  parkingPerHousehold?: number | null;
  /** 단지에 존재하는 평형 목록 (한국식 평수). */
  sizes: number[];
  /** 평형별 통계. */
  sizeStats?: SizeStats[];
  schools?: Schools;
  amenities?: Amenities;
  transport?: Transport;
  /** 단지 한 줄 요약 (비교 카드용). */
  tagline?: string;
  /** 운영자가 직접 작성하는 강점/약점 노트. */
  agentNotes?: {
    pros?: string[];
    cons?: string[];
  };
};

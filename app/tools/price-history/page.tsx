import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "실거래가 추이",
  description: "국토교통부 실거래가 OpenAPI 기반 평형별 시세 차트.",
};

export default function PriceHistoryPage() {
  return (
    <ComingSoon
      eyebrow="TOOLS"
      title="실거래가 추이"
      description="국토부 실거래가 데이터를 매일 자동으로 갱신해 단지·평형별로 라인 차트와 거래량 막대 그래프를 보여드립니다."
      sprintLabel="Sprint 2 공개 예정"
    />
  );
}

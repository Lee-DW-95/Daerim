import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "전세 vs 월세 vs 매매 시뮬레이터",
  description: "내 자본·기간·금리에 가장 유리한 선택을 시나리오 비교.",
};

export default function RentVsBuyPage() {
  return (
    <ComingSoon
      eyebrow="TOOLS"
      title="전세 vs 월세 vs 매매 시뮬레이터"
      description="자본금·대출·보유 기간·시세 상승률·금리를 입력하면 N년 후 순자산을 시나리오별로 비교해 가장 유리한 선택을 알려드립니다."
      sprintLabel="Sprint 3 공개 예정"
    />
  );
}

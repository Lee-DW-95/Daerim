import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "단지 비교 대시보드",
  description: "지웰시티 1·2·3차를 시세·학군·교통까지 한눈에 비교합니다.",
};

export default function CompareToolPage() {
  return (
    <ComingSoon
      eyebrow="TOOLS"
      title="지웰시티 1·2·3차 비교 대시보드"
      description="평형별 매매·전세 시세, 실거래가 추이, 단지 정보, 학군, 편의시설, 교통, 관리비를 한 화면에서 비교하는 시그니처 도구입니다."
      sprintLabel="Sprint 2 공개 예정"
    />
  );
}

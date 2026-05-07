import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "SK하이닉스 직원 매물 매칭",
  description: "직급·가족 구성·예산으로 단지와 평형을 추천받아 보세요.",
};

export default function HynixMatcherPage() {
  return (
    <ComingSoon
      eyebrow="TOOLS"
      title="SK하이닉스 직원 매물 매칭"
      description="직급·가족 구성·거래 유형·예산·우선순위를 입력하면 단지와 평형을 점수 순으로 추천하는 도구입니다."
      sprintLabel="Sprint 3 공개 예정"
    />
  );
}

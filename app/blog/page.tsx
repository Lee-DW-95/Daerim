import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "블로그",
  description: "지웰시티 단지 분석, 하이닉스 가이드, 시장 분기 리포트.",
};

export default function BlogPage() {
  return (
    <ComingSoon
      eyebrow="BLOG"
      title="청주 부동산 인사이트"
      description="지웰시티 1·2·3차 비교, SK하이닉스 발령자 가이드, 학군 정리, 시장 분기 리포트 등 12편 이상의 글을 준비 중입니다."
      sprintLabel="Sprint 4 공개 예정"
    />
  );
}

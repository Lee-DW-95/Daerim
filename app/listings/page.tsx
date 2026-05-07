import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "매물",
  description: "큐레이션된 지웰시티·롯데 오피스텔 매물.",
};

export default function ListingsPage() {
  return (
    <ComingSoon
      eyebrow="LISTINGS"
      title="큐레이션 매물"
      description="개수가 아닌 깊이로 보여드립니다. 매물 사진·도면·운영자 코멘트·실거래가 비교까지 한 페이지에서 확인할 수 있도록 준비 중입니다."
      sprintLabel="Sprint 3 공개 예정"
    />
  );
}

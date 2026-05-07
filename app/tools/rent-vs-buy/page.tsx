import type { Metadata } from "next";

import { RentVsBuyTool } from "@/components/tools/rent-vs-buy-tool";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "전세 vs 월세 vs 매매 시뮬레이터",
  description:
    "내 자본·대출·기간·금리·시세 상승률을 입력하면 매매·전세·월세 시나리오의 N년 후 순자산을 비교합니다.",
};

export default function RentVsBuyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-24">
      <PageHeader
        eyebrow="TOOLS · BUY OR RENT"
        title="전세 vs 월세 vs 매매 시뮬레이터"
        description="매매가 무조건 유리할까? 시세 상승률·금리·보유 기간에 따라 답이 달라집니다. 7가지 입력값으로 세 시나리오의 순자산을 비교해보세요."
      />

      <RentVsBuyTool />
    </div>
  );
}

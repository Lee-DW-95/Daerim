import type { Metadata } from "next";
import Link from "next/link";

import { listListings } from "@/lib/data/listings";
import { ListingsBrowser } from "@/components/listings/listings-browser";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "매물",
  description:
    "청주 지웰시티 1·2·3차 + 롯데 오피스텔 큐레이션 매물. 단지·거래유형·평형으로 필터링하세요.",
};

export default async function ListingsPage() {
  const listings = await listListings();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <header className="mb-10 max-w-2xl space-y-2">
        <p className="text-sm font-medium text-primary">LISTINGS</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          큐레이션 매물
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
          매물 갯수가 아닌 깊이로 보여드립니다. 사이트에 올라오기 전 매물도
          많으니, 원하시는 조건을 알려주시면 직접 안내드립니다.
        </p>
      </header>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            현재 공개된 매물이 없습니다. 운영자에게 사전 문의 주시면 사이트에
            올라오기 전 매물도 안내드려요.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/contact">사전 문의하기</Link>
          </Button>
        </div>
      ) : (
        <ListingsBrowser listings={listings} />
      )}
    </div>
  );
}

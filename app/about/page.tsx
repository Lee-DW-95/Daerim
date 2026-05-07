import type { Metadata } from "next";
import Link from "next/link";
import { Phone, MapPin, MessageCircle } from "lucide-react";

import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KakaoMap } from "@/components/kakao-map";

export const metadata: Metadata = {
  title: "운영자 소개",
  description: `${siteConfig.agent.name} 공인중개사 · 청주 지웰시티 1·2·3차 + 롯데 오피스텔 전담 ${siteConfig.agent.yearsOfExperience}년차.`,
};

export default function AboutPage() {
  const a = siteConfig.agent;
  const c = siteConfig.contact;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center">
        <div className="relative aspect-square w-32 shrink-0 overflow-hidden rounded-2xl border border-border bg-secondary md:w-40">
          <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-muted-foreground md:text-4xl">
            {a.name.slice(0, 1)}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">
            {siteConfig.name}
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {a.name} {a.role}
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            {a.specialty} · {a.yearsOfExperience}년차
          </p>
          {a.licenseNumber ? (
            <p className="text-xs text-muted-foreground">
              공인중개사 등록번호 {a.licenseNumber}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/70">
              공인중개사 등록번호 추후 등록
            </p>
          )}
        </div>
      </div>

      <section className="mb-10 grid gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="space-y-1 p-5">
            <p className="text-xs font-medium text-muted-foreground">
              영업 구역
            </p>
            <p className="text-sm font-semibold leading-snug">
              지웰시티 1·2·3차
              <br />
              롯데 오피스텔 (복대동)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-5">
            <p className="text-xs font-medium text-muted-foreground">경력</p>
            <p className="text-sm font-semibold leading-snug">
              {a.yearsOfExperience}년 / 복대동 거주·근무
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-5">
            <p className="text-xs font-medium text-muted-foreground">
              운영 시간
            </p>
            <p className="text-sm font-semibold leading-snug">
              {c.officeHours}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          왜 이 사이트를 만들었나
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            지웰시티는 1·2·3차가 한 블럭에 붙어 있어 평형·층·향에 따라 가격과
            만족도가 크게 갈립니다. 그런데 막상 비교해서 보여주는 곳은 거의
            없습니다.
          </p>
          <p>
            네이버부동산이나 직방의 매물 카드는 "어디가 더 나은가"에 답해주지
            않습니다. 그래서 직접 사이트를 만들었습니다. 이 동네에서{" "}
            {a.yearsOfExperience}년 일한 시선으로, 데이터와 함께 솔직한 의견을
            드립니다.
          </p>
          <p>
            특히 SK하이닉스 청주캠퍼스 발령으로 처음 청주에 오시는 분들께는
            동선·학군·생활권을 정리한 가이드가 도움이 되도록 신경 썼습니다.
          </p>
        </div>
      </section>

      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          거래 사례
        </h2>
        <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            개인정보를 가린 거래 후기를 곧 정리해 올립니다.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          연락 & 사무실
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <a
                  href={`tel:${c.phoneTel}`}
                  className="text-sm font-medium hover:underline"
                >
                  {c.phone}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-sm leading-relaxed">{c.officeAddress}</p>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                {c.kakaoChannelUrl ? (
                  <a
                    href={c.kakaoChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline"
                  >
                    카카오톡 채널 바로가기
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    카카오톡 채널 추후 등록
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex h-full flex-col gap-3 p-5">
              <p className="text-sm font-medium">방문 상담</p>
              <p className="text-sm text-muted-foreground">
                현장 답사가 필요한 매물은 예약 후 함께 둘러봅니다. 평일·주말
                모두 가능하며, 가능하면 하루 전 연락 부탁드립니다.
              </p>
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                <Button asChild size="sm">
                  <Link href="/contact">문의하기</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={`tel:${c.phoneTel}`}>전화</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="aspect-video w-full">
          <KakaoMap
            address={c.officeAddress}
            lat={c.officeLat}
            lng={c.officeLng}
            level={4}
            markerLabel={siteConfig.name}
          />
        </div>
      </section>
    </div>
  );
}

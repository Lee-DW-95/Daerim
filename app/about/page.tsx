import type { Metadata } from "next";
import Link from "next/link";
import { Phone, MapPin, MessageCircle, Award, Building2 } from "lucide-react";

import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KakaoMap } from "@/components/kakao-map";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "운영자 소개",
  description: `${siteConfig.agent.name} 공인중개사 · 청주 지웰시티 1·2·3차 + 롯데 오피스텔 전담 ${siteConfig.agent.yearsOfExperience}년차.`,
};

export default function AboutPage() {
  const a = siteConfig.agent;
  const c = siteConfig.contact;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-24">
      {/* Hero */}
      <section className="mb-16 grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
        <div className="relative aspect-square w-32 shrink-0 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary to-primary/70 shadow-lg md:w-44">
          <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-primary-foreground md:text-6xl">
            {a.name.slice(0, 1)}
          </div>
        </div>
        <div className="space-y-3">
          <p className="eyebrow">{siteConfig.name}</p>
          <h1 className="text-3xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            {a.name} {a.role}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            {a.specialty} · {a.yearsOfExperience}년차
          </p>
          {a.licenseNumber ? (
            <p className="text-xs text-muted-foreground tabular-nums">
              공인중개사 등록번호 {a.licenseNumber}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/70">
              공인중개사 등록번호 추후 등록
            </p>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="mb-16 grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Building2 className="h-4 w-4" />}
          label="영업 구역"
          value="지웰시티 1·2·3차"
          sub="롯데 오피스텔 (복대동)"
        />
        <StatCard
          icon={<Award className="h-4 w-4" />}
          label="경력"
          value={`${a.yearsOfExperience}년`}
          sub="복대동 거주·근무"
        />
        <StatCard
          icon={<MapPin className="h-4 w-4" />}
          label="운영 시간"
          value={c.officeHours.split("/")[0]?.trim() ?? c.officeHours}
          sub={c.officeHours.includes("/") ? c.officeHours.split("/")[1]?.trim() : undefined}
        />
      </section>

      {/* Philosophy */}
      <section className="mb-16">
        <p className="eyebrow mb-3">PHILOSOPHY</p>
        <h2 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
          왜 이 사이트를 만들었나
        </h2>
        <div className="prose-custom space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          <p>
            지웰시티는 1·2·3차가 한 블럭에 붙어 있어 평형·층·향에 따라 가격과
            만족도가 크게 갈립니다. 그런데 막상 비교해서 보여주는 곳은 거의
            없습니다.
          </p>
          <p>
            네이버부동산이나 직방의 매물 카드는 <strong className="text-foreground">"어디가 더 나은가"</strong>에 답해주지
            않습니다. 그래서 직접 사이트를 만들었습니다. 이 동네에서{" "}
            <strong className="text-foreground">{a.yearsOfExperience}년 일한 시선</strong>으로, 데이터와 함께 솔직한 의견을
            드립니다.
          </p>
          <p>
            특히 SK하이닉스 청주캠퍼스 발령으로 처음 청주에 오시는 분들께는
            동선·학군·생활권을 정리한 가이드가 도움이 되도록 신경 썼습니다.
          </p>
        </div>
      </section>

      {/* 거래 사례 */}
      <section className="mb-16">
        <p className="eyebrow mb-3">CASES</p>
        <h2 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
          거래 사례
        </h2>
        <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            개인정보를 가린 거래 후기를 곧 정리해 올립니다.
          </p>
        </div>
      </section>

      {/* Contact + Map */}
      <section>
        <p className="eyebrow mb-3">CONTACT</p>
        <h2 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
          연락 & 사무실
        </h2>
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <Card className="card-lift">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">전화</p>
                  <a
                    href={`tel:${c.phoneTel}`}
                    className="text-base font-semibold tabular-nums hover:underline"
                  >
                    {c.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">사무실</p>
                  <p className="text-sm leading-relaxed">{c.officeAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">카카오톡</p>
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
              </div>
            </CardContent>
          </Card>
          <Card className="card-lift">
            <CardContent className="flex h-full flex-col gap-3 p-6">
              <p className="text-sm font-semibold">방문 상담</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                현장 답사가 필요한 매물은 예약 후 함께 둘러봅니다. 평일·주말
                모두 가능하며, 가능하면 하루 전 연락 부탁드립니다.
              </p>
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                <Button asChild>
                  <Link href="/contact">
                    <MessageCircle className="mr-1.5 h-4 w-4" />
                    문의하기
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <a href={`tel:${c.phoneTel}`}>
                    <Phone className="mr-1.5 h-4 w-4" />
                    전화
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border shadow-sm">
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

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="card-lift">
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="text-primary">{icon}</span>
          {label}
        </div>
        <p className="text-base font-semibold leading-snug">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

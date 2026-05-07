import type { Metadata } from "next";
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";

import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KakaoMap } from "@/components/kakao-map";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "문의",
  description: `${siteConfig.name} 운영자 ${siteConfig.agent.name}에게 직접 문의하세요. 전화·카카오톡·방문 상담 가능.`,
};

export default function ContactPage() {
  const c = siteConfig.contact;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-24">
      <PageHeader
        eyebrow="CONTACT"
        title={`${siteConfig.agent.name} 공인중개사에게 문의`}
        description="매물 문의, 단지 추천, 시세 상담 모두 운영자가 직접 응답합니다."
      />

      <section className="mb-12 grid gap-4 md:grid-cols-3">
        <Card className="card-lift">
          <CardContent className="space-y-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                전화
              </p>
              <a
                href={`tel:${c.phoneTel}`}
                className="mt-1 block text-2xl font-bold tracking-tight tabular-nums hover:underline"
              >
                {c.phone}
              </a>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              모바일에서 탭하면 바로 통화 연결됩니다.
            </p>
          </CardContent>
        </Card>

        <Card className="card-lift">
          <CardContent className="space-y-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                카카오톡
              </p>
              <p className="mt-1 text-base font-semibold leading-tight">
                채널 메시지
              </p>
            </div>
            {c.kakaoChannelUrl ? (
              <Button
                asChild
                className="w-full bg-[#FEE500] text-black shadow-sm hover:bg-[#FFD700]"
              >
                <a
                  href={c.kakaoChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  카톡 채널로 문의
                </a>
              </Button>
            ) : (
              <Button disabled className="w-full" variant="secondary">
                채널 준비 중
              </Button>
            )}
            <p className="text-xs leading-relaxed text-muted-foreground">
              {c.kakaoChannelUrl
                ? "채널 추가 후 메시지 보내주세요."
                : "카카오톡 채널은 곧 오픈 예정입니다."}
            </p>
          </CardContent>
        </Card>

        <Card className="card-lift">
          <CardContent className="space-y-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                운영 시간
              </p>
              <p className="mt-1 text-base font-semibold leading-snug">
                {c.officeHours}
              </p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              방문 상담은 가능하면 하루 전 예약 부탁드립니다.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-12">
        <p className="eyebrow mb-3">FORM</p>
        <h2 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
          문의 폼
        </h2>
        <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Tally 폼 임베드 자리 (Sprint 1 후반부에 폼 ID 받아 연결).
          </p>
          <p className="mt-1 text-xs text-muted-foreground/80">
            그 전까지는 전화 또는 카카오톡으로 문의 부탁드립니다.
          </p>
        </div>
      </section>

      <section>
        <p className="eyebrow mb-3">LOCATION</p>
        <h2 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
          사무실 위치
        </h2>
        <Card className="overflow-hidden">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-base font-semibold">{c.officeAddress}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  지웰시티 단지 도보 5분 이내
                </p>
              </div>
            </div>
            <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-border">
              <KakaoMap
                address={c.officeAddress}
                lat={c.officeLat}
                lng={c.officeLng}
                level={4}
                markerLabel={siteConfig.name}
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

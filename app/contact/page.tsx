import type { Metadata } from "next";
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";

import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "문의",
  description: `${siteConfig.name} 운영자 ${siteConfig.agent.name}에게 직접 문의하세요. 전화·카카오톡·방문 상담 가능.`,
};

export default function ContactPage() {
  const c = siteConfig.contact;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <header className="mb-10 space-y-2">
        <p className="text-sm font-medium text-primary">CONTACT</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {siteConfig.agent.name} 공인중개사에게 문의
        </h1>
        <p className="text-base text-muted-foreground">
          매물 문의, 단지 추천, 시세 상담 모두 운영자가 직접 응답합니다.
        </p>
      </header>

      <section className="mb-10 grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">전화</p>
            </div>
            <a
              href={`tel:${c.phoneTel}`}
              className="block text-xl font-semibold tracking-tight tabular-nums hover:underline"
            >
              {c.phone}
            </a>
            <p className="text-xs text-muted-foreground">
              모바일에서 탭하면 바로 통화 연결됩니다.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">카카오톡</p>
            </div>
            {c.kakaoChannelUrl ? (
              <Button asChild className="w-full bg-[#FEE500] text-black hover:bg-[#FFD700]">
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
            <p className="text-xs text-muted-foreground">
              {c.kakaoChannelUrl
                ? "채널 추가 후 메시지 보내주세요."
                : "카카오톡 채널은 곧 오픈 예정입니다."}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">운영 시간</p>
            </div>
            <p className="text-sm leading-relaxed">{c.officeHours}</p>
            <p className="text-xs text-muted-foreground">
              방문 상담은 가능하면 하루 전 예약 부탁드립니다.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold tracking-tight md:text-2xl">
          문의 폼
        </h2>
        <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Tally 폼 임베드 자리 (Sprint 1 후반부에 폼 ID 받아 연결).
          </p>
          <p className="mt-1 text-xs text-muted-foreground/80">
            그 전까지는 전화 또는 카카오톡으로 문의 부탁드립니다.
          </p>
        </div>
        {/*
          Tally 폼 ID가 정해지면 위 placeholder를 아래로 교체:
          <iframe
            src="https://tally.so/embed/<FORM_ID>?hideTitle=1&transparentBackground=1"
            width="100%"
            height="600"
            frameBorder="0"
            title="문의 폼"
          />
        */}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight md:text-2xl">
          사무실 위치
        </h2>
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{c.officeAddress}</p>
                <p className="text-xs text-muted-foreground">
                  지웰시티 단지 도보 5분 이내
                </p>
              </div>
            </div>
            <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border border-dashed border-border bg-secondary/40">
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                지도 임베드 자리 (카카오 지도 또는 네이버 지도)
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

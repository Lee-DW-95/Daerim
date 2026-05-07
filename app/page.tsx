import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  GitCompareArrows,
  Cpu,
  Phone,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { siteConfig, toolsNav } from "@/lib/site-config";

const heroToolIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "/tools/compare": GitCompareArrows,
  "/tools/price-history": BarChart3,
  "/tools/hynix-matcher": Cpu,
};

export default function HomePage() {
  const featuredTools = toolsNav.filter((tool) => tool.href in heroToolIcons);

  return (
    <div className="flex flex-col">
      <section className="relative border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr] md:px-6 md:py-24">
          <div className="flex flex-col justify-center gap-6">
            <Badge
              variant="outline"
              className="w-fit border-primary/20 bg-primary/5 text-primary"
            >
              청주 지웰시티 1·2·3차 · 롯데 오피스텔 전담
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {siteConfig.tagline}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              매물 갯수로 승부하지 않습니다. 단지를 비교하고, 실거래가를
              읽고, 직장·가족·예산에 맞는 답을 데이터로 보여드립니다.{" "}
              <span className="text-foreground font-medium">
                {siteConfig.agent.name}
              </span>{" "}
              공인중개사 ·{" "}
              <span className="font-medium text-foreground">
                {siteConfig.agent.yearsOfExperience}년차
              </span>
              .
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/tools/compare">
                  단지 비교 시작하기
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">
                  <MessageCircle className="mr-1.5 h-4 w-4" />
                  상담 문의
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-end">
            <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-secondary">
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-3xl font-semibold text-muted-foreground">
                  {siteConfig.agent.name.slice(0, 1)}
                </div>
                <p className="text-sm font-medium text-foreground">
                  {siteConfig.agent.name} 공인중개사
                </p>
                <p className="text-xs text-muted-foreground">
                  운영자 사진 추후 등록
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">CORE TOOLS</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
                결정에 도움이 되는 도구 3가지
              </h2>
            </div>
            <Link
              href="/tools"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              전체 도구 보기 →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {featuredTools.map((tool) => {
              const Icon = heroToolIcons[tool.href];
              return (
                <Card
                  key={tool.href}
                  className="group transition-colors hover:border-primary/40"
                >
                  <CardContent className="flex h-full flex-col gap-4 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <h3 className="text-base font-semibold leading-tight">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                    <Link
                      href={tool.href}
                      className="inline-flex items-center text-sm font-medium text-primary transition-colors group-hover:underline"
                    >
                      도구 사용하기
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-primary">LISTINGS</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
                큐레이션 매물
              </h2>
            </div>
            <Link
              href="/listings"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              전체 매물 →
            </Link>
          </div>

          <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              엄선된 매물을 곧 공개합니다. 운영자에게 직접 의뢰하면 사이트에
              올라오기 전 매물도 안내받을 수 있어요.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/contact">사전 문의하기</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-primary">INSIGHTS</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
                최신 인사이트
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              전체 글 →
            </Link>
          </div>

          <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              지웰시티 비교, 하이닉스 발령자 가이드, 시장 분기 리포트 등 12편
              이상의 글을 곧 발행합니다.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <div className="rounded-2xl border border-border bg-primary p-8 text-primary-foreground md:p-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  지웰시티, 직접 보고 결정하세요.
                </h2>
                <p className="max-w-xl text-sm text-primary-foreground/80 md:text-base">
                  방문 상담은 예약제로 진행합니다. 어떤 단지·평형이 본인에게
                  맞는지 모르겠다면 카카오톡으로 편하게 물어보세요.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand-gold text-brand-gold-foreground hover:bg-brand-gold/90"
                >
                  <Link href="/contact">
                    <MessageCircle className="mr-1.5 h-4 w-4" />
                    문의 페이지로
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <a href={`tel:${siteConfig.contact.phoneTel}`}>
                    <Phone className="mr-1.5 h-4 w-4" />
                    {siteConfig.contact.phone}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

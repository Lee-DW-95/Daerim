import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  GitCompareArrows,
  Cpu,
  Phone,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { siteConfig, toolsNav } from "@/lib/site-config";
import { listListings } from "@/lib/data/listings";
import { ListingCard } from "@/components/listings/listing-card";

const heroToolIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "/tools/compare": GitCompareArrows,
  "/tools/price-history": BarChart3,
  "/tools/hynix-matcher": Cpu,
};

export default async function HomePage() {
  const featuredTools = toolsNav.filter((tool) => tool.href in heroToolIcons);
  const featuredListings = (await listListings()).slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-bg relative border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-[1.2fr_1fr] md:px-6 md:py-32">
          <div className="flex flex-col justify-center gap-7">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="eyebrow">
                청주 지웰시티 1·2·3차 · 롯데 오피스텔 전담
              </span>
            </div>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-6xl">
              <span className="gradient-text">{siteConfig.tagline}</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              매물 갯수로 승부하지 않습니다. 단지를 비교하고, 실거래가를
              읽고, 직장·가족·예산에 맞는 답을 데이터로 보여드립니다.{" "}
              <span className="font-medium text-foreground">
                {siteConfig.agent.name}
              </span>{" "}
              공인중개사 ·{" "}
              <span className="font-medium text-foreground">
                {siteConfig.agent.yearsOfExperience}년차
              </span>
              .
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" className="h-11 px-6 shadow-sm">
                <Link href="/tools/compare">
                  단지 비교 시작하기
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 px-6">
                <Link href="/contact">
                  <MessageCircle className="mr-1.5 h-4 w-4" />
                  상담 문의
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-end">
            <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-secondary to-secondary/40 shadow-lg">
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-foreground shadow-xl">
                  {siteConfig.agent.name.slice(0, 1)}
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {siteConfig.agent.name} 공인중개사
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    운영자 사진 추후 등록
                  </p>
                </div>
                <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-xs backdrop-blur">
                  <p className="font-medium text-foreground">
                    {siteConfig.agent.yearsOfExperience}년 영업
                  </p>
                  <p className="mt-0.5 text-muted-foreground">
                    {siteConfig.agent.specialty}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Tools */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
          <div className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">CORE TOOLS</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                결정에 도움이 되는 도구
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                매물을 보기 전에 단지를 알고, 단지를 보기 전에 시세 흐름을 알아야
                합니다.
              </p>
            </div>
            <Link
              href="/tools"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              전체 도구 보기
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {featuredTools.map((tool) => {
              const Icon = heroToolIcons[tool.href];
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group block"
                >
                  <Card className="card-lift h-full border-border/80">
                    <CardContent className="flex h-full flex-col gap-5 p-7">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="text-lg font-semibold leading-tight tracking-tight">
                          {tool.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {tool.description}
                        </p>
                      </div>
                      <span className="inline-flex items-center text-sm font-medium text-primary">
                        도구 사용하기
                        <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="border-b border-border bg-secondary/20">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="eyebrow">LISTINGS</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                큐레이션 매물
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                갯수가 아닌 깊이로 보여드립니다. 사진·운영자 코멘트·실거래가
                비교까지 한 화면에서.
              </p>
            </div>
            <Link
              href="/listings"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              전체 매물
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {featuredListings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-background p-12 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-4 text-sm text-muted-foreground">
                엄선된 매물을 곧 공개합니다. 운영자에게 직접 의뢰하면 사이트에
                올라오기 전 매물도 안내받을 수 있어요.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-5">
                <Link href="/contact">사전 문의하기</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.slug} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Insights */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="eyebrow">INSIGHTS</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                최신 인사이트
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                지웰시티 단지 분석, 하이닉스 가이드, 학군·시장 리포트.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              전체 글
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Badge
              variant="outline"
              className="rounded-xl border-border/60 bg-card p-5 text-left"
              asChild
            >
              <Link href="/blog/jiwell-1-2-3-compare" className="block">
                <span className="block text-xs font-medium text-primary">
                  단지분석
                </span>
                <span className="mt-2 block text-sm font-semibold leading-snug">
                  지웰시티 1차 vs 2차 vs 3차 완벽 비교
                </span>
              </Link>
            </Badge>
            <Badge
              variant="outline"
              className="rounded-xl border-border/60 bg-card p-5 text-left"
              asChild
            >
              <Link href="/blog/hynix-cheongju-relocation-guide" className="block">
                <span className="block text-xs font-medium text-primary">
                  하이닉스
                </span>
                <span className="mt-2 block text-sm font-semibold leading-snug">
                  SK하이닉스 청주 발령자가 알아야 할 5가지
                </span>
              </Link>
            </Badge>
            <Badge
              variant="outline"
              className="rounded-xl border-border/60 bg-card p-5 text-left"
              asChild
            >
              <Link href="/blog/jiwell-school-district-guide" className="block">
                <span className="block text-xs font-medium text-primary">
                  학군
                </span>
                <span className="mt-2 block text-sm font-semibold leading-snug">
                  지웰시티 학군 완벽 정리 (서촌초·솔밭초·복대중)
                </span>
              </Link>
            </Badge>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-primary p-10 text-primary-foreground md:p-16">
            <div
              aria-hidden
              className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-gold/20 blur-3xl"
            />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                  Let&apos;s talk
                </p>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  지웰시티, 직접 보고 결정하세요.
                </h2>
                <p className="max-w-xl text-sm text-primary-foreground/70 md:text-base">
                  방문 상담은 예약제로 진행합니다. 어떤 단지·평형이 맞는지
                  모르겠다면 카카오톡으로 편하게 물어보세요.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand-gold text-brand-gold-foreground shadow-lg hover:bg-brand-gold/90"
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

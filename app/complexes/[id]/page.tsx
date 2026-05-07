import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  GraduationCap,
  Car,
  ShoppingBag,
  Calendar,
  Users,
  MessageCircle,
} from "lucide-react";

import {
  fetchAptTradesRange,
  groupByComplexSizeMonth,
  recentMonths,
  iterateYearMonth,
  LAWD_CD,
  type DealGroupStat,
} from "@/lib/molit-api";
import { complexes, getComplex } from "@/lib/data/complexes";
import { listListings } from "@/lib/data/listings";
import { getAllPosts } from "@/lib/mdx";
import { siteConfig } from "@/lib/site-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ListingCard } from "@/components/listings/listing-card";
import { PostCard } from "@/components/blog/post-card";
import { ComplexPriceTrend } from "@/components/complexes/complex-price-trend";

import type { ComplexId } from "@/lib/types/complex";
import type { PriceHistorySeries } from "@/components/tools/price-history-tool";

export const revalidate = 86400;

type Params = { id: string };

export function generateStaticParams() {
  return complexes.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const complex = getComplex(id as ComplexId);
  if (!complex) return { title: "단지를 찾을 수 없습니다" };
  return {
    title: complex.name,
    description: `${complex.name} (${complex.address}) 시세·실거래가·매물·관련 글을 한 화면에서 확인하세요. 입주 ${complex.buildYear ?? "?"}년 / ${complex.households?.toLocaleString("ko-KR") ?? "?"}세대.`,
    openGraph: {
      title: `${complex.name} · ${siteConfig.name}`,
      description:
        complex.tagline ??
        `${complex.name} 시세·실거래가·매물을 한 화면에서.`,
      images: [
        `/og?title=${encodeURIComponent(complex.name)}&category=${encodeURIComponent(
          "단지 정보"
        )}&subtitle=${encodeURIComponent(
          complex.tagline ?? `${complex.address} · ${complex.type}`
        )}`,
      ],
    },
  };
}

const MONTHS_OF_HISTORY = 36;

function toSeries(stats: DealGroupStat[]): PriceHistorySeries[] {
  return stats.map((s) => ({
    complexId: s.complexId,
    sizePyeong: s.sizePyeong,
    yearMonth: `${s.yearMonth.slice(0, 4)}-${s.yearMonth.slice(4, 6)}`,
    count: s.count,
    avgManwon: s.avgManwon,
    medianManwon: s.medianManwon,
    minManwon: s.minManwon,
    maxManwon: s.maxManwon,
  }));
}

function fmt(n: number | null | undefined, suffix = ""): string {
  if (n == null) return "정보 미공개";
  return `${n.toLocaleString("ko-KR")}${suffix}`;
}

export default async function ComplexDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const complex = getComplex(id as ComplexId);
  if (!complex) notFound();

  const months = recentMonths(MONTHS_OF_HISTORY);
  const fromYm = months[0];
  const toYm = months[months.length - 1];

  const tradeRaw = await fetchAptTradesRange({
    lawdCd: LAWD_CD.cheongjuHeungdeok,
    fromYm,
    toYm,
    kind: "trade",
  });

  const stats = groupByComplexSizeMonth(
    tradeRaw.filter((d) => d.complexId === complex.id)
  );

  const monthLabels = Array.from(iterateYearMonth(fromYm, toYm)).map(
    (ym) => `${ym.slice(0, 4)}-${ym.slice(4, 6)}`
  );

  // 같은 단지 매물·관련 글
  const relatedListings = (await listListings()).filter(
    (l) => l.complexId === complex.id
  );
  const relatedPosts = getAllPosts().filter((p) =>
    p.tags?.some((t) => t.includes(complex.shortName) || t === "지웰시티")
  );

  // 평균 매매가 (전체 평형 통합)
  const totalCount = stats.reduce((s, x) => s + x.count, 0);
  const overallAvg =
    totalCount === 0
      ? null
      : Math.round(
          stats.reduce((s, x) => s + x.avgManwon * x.count, 0) / totalCount
        );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <Link
        href="/tools/compare"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        전체 단지 비교로
      </Link>

      <header className="mb-10 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{complex.type}</Badge>
          {complex.buildYear && (
            <Badge variant="outline">{complex.buildYear}년 입주</Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {complex.name}
        </h1>
        <p className="text-base text-muted-foreground">{complex.address}</p>
        {complex.tagline && (
          <p className="text-sm leading-relaxed text-foreground/80 md:text-base">
            {complex.tagline}
          </p>
        )}
      </header>

      {/* 핵심 지표 */}
      <section className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          icon={<Calendar className="h-4 w-4" />}
          label="입주연도"
          value={fmt(complex.buildYear, "년")}
        />
        <Stat
          icon={<Users className="h-4 w-4" />}
          label="세대수"
          value={fmt(complex.households, "세대")}
        />
        <Stat
          icon={<Building2 className="h-4 w-4" />}
          label="유형"
          value={
            complex.maxFloor
              ? `${complex.type} (최고 ${complex.maxFloor}층)`
              : complex.type
          }
        />
        <Stat
          icon={<Building2 className="h-4 w-4" />}
          label="평형 라인업"
          value={
            complex.sizes.length > 0
              ? complex.sizes.map((s) => `${s}평`).join(" · ")
              : "정보 미공개"
          }
        />
      </section>

      {/* 시세 추이 */}
      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-primary">PRICE TREND</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              평형별 매매가 추이
            </h2>
          </div>
          {overallAvg != null && (
            <Badge variant="outline" className="tabular-nums">
              전체 평균 {overallAvg.toLocaleString("ko-KR")}만원
            </Badge>
          )}
        </div>
        <ComplexPriceTrend
          complexId={complex.id}
          trade={toSeries(stats)}
          monthLabels={monthLabels}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/tools/price-history?complex=${complex.id}`}>
              실거래가 추이 도구로 →
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/tools/compare">다른 단지와 비교 →</Link>
          </Button>
        </div>
      </section>

      {/* 학군·편의·교통 */}
      <section className="mb-10 grid gap-4 md:grid-cols-3">
        <InfoCard
          icon={<GraduationCap className="h-5 w-5 text-primary" />}
          title="학군"
        >
          {complex.schools ? (
            <ul className="space-y-1 text-sm">
              {complex.schools.elementary?.length ? (
                <li>
                  <span className="text-xs text-muted-foreground">초등 ·</span>{" "}
                  {complex.schools.elementary.join(", ")}
                </li>
              ) : null}
              {complex.schools.middle?.length ? (
                <li>
                  <span className="text-xs text-muted-foreground">중등 ·</span>{" "}
                  {complex.schools.middle.join(", ")}
                </li>
              ) : null}
              {complex.schools.high?.length ? (
                <li>
                  <span className="text-xs text-muted-foreground">고등 ·</span>{" "}
                  {complex.schools.high.join(", ")}
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">정보 미공개</p>
          )}
        </InfoCard>

        <InfoCard
          icon={<ShoppingBag className="h-5 w-5 text-primary" />}
          title="편의시설"
        >
          <ul className="space-y-1 text-sm">
            <li>
              <span className="text-xs text-muted-foreground">지웰시티몰 ·</span>{" "}
              {fmt(complex.amenities?.jiwellMallWalkMin, "분 (도보)")}
            </li>
            <li>
              <span className="text-xs text-muted-foreground">현대백화점 ·</span>{" "}
              {fmt(complex.amenities?.hyundaiDeptWalkMin, "분 (도보)")}
            </li>
          </ul>
        </InfoCard>

        <InfoCard
          icon={<Car className="h-5 w-5 text-primary" />}
          title="교통"
        >
          <ul className="space-y-1 text-sm">
            <li>
              <span className="text-xs text-muted-foreground">SK하이닉스 ·</span>{" "}
              {fmt(complex.transport?.hynixCarMin, "분 (차량)")}
            </li>
            <li>
              <span className="text-xs text-muted-foreground">서청주IC ·</span>{" "}
              {fmt(complex.transport?.seocheongjuIcCarMin, "분 (차량)")}
            </li>
            <li>
              <span className="text-xs text-muted-foreground">오송역 ·</span>{" "}
              {fmt(complex.transport?.osongCarMin, "분 (차량)")}
            </li>
          </ul>
        </InfoCard>
      </section>

      {/* 같은 단지 매물 */}
      {relatedListings.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-primary">LISTINGS</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
                {complex.shortName} 매물
              </h2>
            </div>
            <Link
              href="/listings"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              전체 매물 →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedListings.slice(0, 3).map((listing) => (
              <ListingCard key={listing.slug} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* 관련 글 */}
      {relatedPosts.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-primary">RELATED</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
                관련 글
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              전체 글 →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedPosts.slice(0, 3).map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      <Separator className="my-10" />

      {/* CTA */}
      <section className="rounded-2xl border border-border bg-primary p-6 text-primary-foreground md:p-10">
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          {complex.shortName} 매물·시세 직접 상담
        </h2>
        <p className="mt-2 text-sm text-primary-foreground/80 md:text-base">
          사이트에 올라오기 전 매물도 많습니다. 원하시는 평형·층·향을
          알려주시면 맞는 매물 나오는 즉시 안내드립니다.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            asChild
            size="lg"
            className="bg-brand-gold text-brand-gold-foreground hover:bg-brand-gold/90"
          >
            <Link href="/contact">
              <MessageCircle className="mr-1.5 h-4 w-4" />
              상담 요청
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link href={`/tools/hynix-matcher`}>
              하이닉스 매칭 도구
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1 text-base font-semibold leading-snug">{value}</p>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-sm font-semibold">{title}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

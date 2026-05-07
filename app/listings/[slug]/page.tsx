import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Compass,
  Calendar,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

import { getListing, listListings } from "@/lib/data/listings";
import { getComplex } from "@/lib/data/complexes";
import {
  fetchAptTradesRange,
  groupByComplexSizeMonth,
  recentMonths,
  LAWD_CD,
} from "@/lib/molit-api";
import { siteConfig } from "@/lib/site-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatManwon, formatPyeong, formatCount } from "@/lib/format";
import {
  DEAL_KIND_LABEL,
  DIRECTION_LABEL,
  STATUS_LABEL,
} from "@/lib/types/listing";

export const revalidate = 86400;

type Params = { slug: string };

export async function generateStaticParams() {
  return (await listListings()).map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return { title: "매물을 찾을 수 없습니다" };
  const complex = getComplex(listing.complexId);
  return {
    title: listing.headline,
    description: `${complex?.name ?? ""} ${formatPyeong(listing.sizePyeong)} ${DEAL_KIND_LABEL[listing.dealKind]} ${formatManwon(listing.priceManwon, { unit: "auto" })}. ${listing.agentNote.slice(0, 80)}`,
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) notFound();

  const complex = getComplex(listing.complexId);

  // 같은 단지·같은 평형의 최근 6개월 매매 비교 (참고용).
  const months = recentMonths(6);
  const tradeRaw = await fetchAptTradesRange({
    lawdCd: LAWD_CD.cheongjuHeungdeok,
    fromYm: months[0],
    toYm: months[months.length - 1],
    kind: "trade",
  }).catch(() => []);

  const stats = groupByComplexSizeMonth(
    tradeRaw.filter(
      (d) =>
        d.complexId === listing.complexId &&
        d.sizePyeong === listing.sizePyeong
    )
  );

  const recentDealsCount = stats.reduce((sum, s) => sum + s.count, 0);
  const recentAvg =
    recentDealsCount === 0
      ? null
      : Math.round(
          stats.reduce((sum, s) => sum + s.avgManwon * s.count, 0) /
            recentDealsCount
        );

  const priceDiffPct =
    recentAvg && listing.dealKind === "trade"
      ? ((listing.priceManwon - recentAvg) / recentAvg) * 100
      : null;

  const priceLabel =
    listing.dealKind === "monthly" && listing.monthlyRentManwon
      ? `${formatManwon(listing.priceManwon, { unit: "auto" })} / 월 ${listing.monthlyRentManwon}만원`
      : formatManwon(listing.priceManwon, { unit: "auto" });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-20">
      <Link
        href="/listings"
        className="mb-8 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        매물 목록
      </Link>

      <header className="mb-10 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="shadow-sm">
            {DEAL_KIND_LABEL[listing.dealKind]}
          </Badge>
          {listing.status !== "available" && (
            <Badge variant="secondary" className="shadow-sm">
              {STATUS_LABEL[listing.status]}
            </Badge>
          )}
          <span className="text-sm font-medium text-muted-foreground">
            {complex?.name ?? "단지 정보 없음"}
          </span>
        </div>
        <h1 className="text-3xl font-bold leading-[1.15] tracking-tight md:text-5xl">
          {listing.headline}
        </h1>
        <p className="text-3xl font-bold tracking-tight tabular-nums text-primary md:text-4xl">
          {priceLabel}
        </p>
      </header>

      {/* Gallery — 사진 갯수에 따라 동적 레이아웃 */}
      <section className="mb-10">
        <ListingGallery
          headline={listing.headline}
          images={listing.images}
        />
      </section>

      {/* Core info */}
      <section className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        <InfoCell
          icon={<Building2 className="h-4 w-4" />}
          label="평형"
          value={`${formatPyeong(listing.sizePyeong)}${listing.exclusiveAreaSqm ? ` (${listing.exclusiveAreaSqm}㎡)` : ""}`}
        />
        <InfoCell
          icon={<Building2 className="h-4 w-4" />}
          label="층"
          value={`${listing.currentFloor}${listing.totalFloor ? `/${listing.totalFloor}` : ""}층`}
        />
        <InfoCell
          icon={<Compass className="h-4 w-4" />}
          label="향"
          value={DIRECTION_LABEL[listing.direction]}
        />
        <InfoCell
          icon={<Calendar className="h-4 w-4" />}
          label="입주 가능"
          value={listing.availableFrom}
        />
      </section>

      {/* Agent note */}
      <section className="mb-12">
        <Card className="overflow-hidden border-primary/30 bg-primary/5">
          <CardContent className="space-y-3 p-7">
            <p className="eyebrow">운영자 코멘트</p>
            <p className="text-base leading-relaxed text-foreground/90 md:text-lg">
              {listing.agentNote}
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {siteConfig.agent.name.slice(0, 1)}
              </span>
              <span>
                {siteConfig.agent.name} {siteConfig.agent.role} ·{" "}
                {siteConfig.agent.yearsOfExperience}년차
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Pros / Cons */}
      {(listing.pros.length > 0 || listing.cons.length > 0) && (
        <section className="mb-12 grid gap-4 md:grid-cols-2">
          {listing.pros.length > 0 && (
            <Card className="card-lift">
              <CardContent className="space-y-3 p-6">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  강점
                </p>
                <ul className="space-y-1.5 text-sm">
                  {listing.pros.map((p, i) => (
                    <li key={i}>· {p}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {listing.cons.length > 0 && (
            <Card className="card-lift">
              <CardContent className="space-y-3 p-6">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  주의 / 약점
                </p>
                <ul className="space-y-1.5 text-sm">
                  {listing.cons.map((p, i) => (
                    <li key={i}>· {p}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* Features */}
      {listing.features.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 flex items-center gap-1.5 text-lg font-bold tracking-tight">
            <Sparkles className="h-4 w-4 text-primary" />
            주요 옵션·시설
          </h2>
          <div className="flex flex-wrap gap-2">
            {listing.features.map((f, i) => (
              <Badge key={i} variant="secondary" className="text-sm">
                {f}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Recent transactions */}
      {listing.dealKind === "trade" && (
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-bold tracking-tight">
            최근 6개월 같은 평형 실거래
          </h2>
          {recentDealsCount === 0 || recentAvg == null ? (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                최근 6개월 내 같은 단지·평형의 매칭된 거래가 없습니다.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="grid gap-4 p-5 md:grid-cols-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    같은 평형 평균
                  </p>
                  <p className="mt-1 text-xl font-bold tabular-nums">
                    {formatManwon(recentAvg, { unit: "auto" })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    표본 수
                  </p>
                  <p className="mt-1 text-xl font-bold tabular-nums">
                    {formatCount(recentDealsCount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    이 매물 vs 평균
                  </p>
                  <p
                    className={`mt-1 text-xl font-bold tabular-nums ${
                      priceDiffPct == null
                        ? ""
                        : priceDiffPct > 5
                          ? "text-amber-600 dark:text-amber-400"
                          : priceDiffPct < -5
                            ? "text-emerald-600 dark:text-emerald-400"
                            : ""
                    }`}
                  >
                    {priceDiffPct == null
                      ? "—"
                      : `${priceDiffPct > 0 ? "+" : ""}${priceDiffPct.toFixed(1)}%`}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            국토교통부 실거래가 기준 · 1일 1회 자동 갱신
          </p>
        </section>
      )}

      {/* Complex info */}
      {complex && (
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-bold tracking-tight">단지 정보</h2>
          <Card>
            <CardContent className="grid gap-3 p-5 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold">{complex.name}</p>
                {complex.tagline && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {complex.tagline}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {complex.address}
                </p>
              </div>
              <div className="space-y-1 text-sm">
                <Row
                  label="입주연도"
                  value={complex.buildYear ? `${complex.buildYear}년` : "—"}
                />
                <Row
                  label="세대수"
                  value={
                    complex.households
                      ? `${complex.households.toLocaleString("ko-KR")}세대`
                      : "—"
                  }
                />
                <Row label="유형" value={complex.type} />
                {complex.schools && (
                  <Row
                    label="학군"
                    value={[
                      ...(complex.schools.elementary ?? []),
                      ...(complex.schools.middle ?? []),
                    ].join(", ")}
                  />
                )}
              </div>
            </CardContent>
          </Card>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/complexes/${complex.id}`}>
                {complex.shortName} 단지 페이지 →
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link
                href={`/tools/compare?complex=${complex.id}&size=${listing.sizePyeong}`}
              >
                다른 단지와 비교 →
              </Link>
            </Button>
          </div>
        </section>
      )}

      <Separator className="my-10" />

      {/* CTA */}
      <section className="rounded-2xl border border-border bg-primary p-6 text-primary-foreground md:p-10">
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          이 매물 직접 보러 가실래요?
        </h2>
        <p className="mt-2 text-sm text-primary-foreground/80 md:text-base">
          방문 일정은 운영자가 직접 조율해드립니다. 카카오톡 또는 전화로
          편하게 문의 주세요.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
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
      </section>
    </div>
  );
}

function ListingGallery({
  headline,
  images,
}: {
  headline: string;
  images: string[];
}) {
  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/9] w-full flex-col items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground">
        <Building2 className="h-12 w-12 opacity-50" />
        <p className="mt-2 text-sm">사진은 곧 업데이트됩니다</p>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-secondary">
        <img
          src={images[0]}
          alt={headline}
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // 2장 이상이면 큰 사진 + 우측 작은 사진(들)
  const secondaryCount = Math.min(images.length - 1, 2);

  return (
    <div className="grid gap-2 md:grid-cols-3">
      <div className="relative col-span-2 aspect-[4/3] overflow-hidden rounded-xl border border-border bg-secondary">
        <img
          src={images[0]}
          alt={headline}
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <div
        className={`grid gap-2 ${
          secondaryCount === 1
            ? "grid-cols-1"
            : "grid-cols-2 md:grid-cols-1"
        }`}
      >
        {Array.from({ length: secondaryCount }, (_, i) => i + 1).map((idx) => (
          <div
            key={idx}
            className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-secondary"
          >
            <img
              src={images[idx]}
              alt={`${headline} ${idx + 1}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1 text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right tabular-nums">{value}</span>
    </div>
  );
}

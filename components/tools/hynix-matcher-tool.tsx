"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle, TrendingUp, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatManwon, formatPyeong, formatCount } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import {
  MATCHER_LABELS,
  rankRecommendations,
  type DealKind,
  type Family,
  type MatcherInput,
  type Priority,
  type Rank,
  type Recommendation,
  type SizeMarketStat,
} from "@/lib/matcher";

import type { Complex } from "@/lib/types/complex";

type Props = {
  complexes: Complex[];
  marketStats: SizeMarketStat[];
};

const DEFAULT_BUDGET_BY_KIND: Record<DealKind, number> = {
  trade: 80000, // 8억
  rent_jeonse: 50000, // 5억
  rent_monthly: 200, // 200만
};

const BUDGET_RANGE: Record<DealKind, { min: number; max: number; step: number }> = {
  trade: { min: 30000, max: 200000, step: 5000 },
  rent_jeonse: { min: 20000, max: 120000, step: 2500 },
  rent_monthly: { min: 50, max: 500, step: 10 },
};

export function HynixMatcherTool({ complexes, marketStats }: Props) {
  const [rank, setRank] = React.useState<Rank>("manager");
  const [family, setFamily] = React.useState<Family>("couple");
  const [dealKind, setDealKind] = React.useState<DealKind>("trade");
  const [budget, setBudget] = React.useState<number>(
    DEFAULT_BUDGET_BY_KIND.trade
  );
  const [priorities, setPriorities] = React.useState<Set<Priority>>(
    () => new Set(["commute", "newness"])
  );
  const [submitted, setSubmitted] = React.useState(false);

  // 거래 유형이 바뀌면 예산 기본값을 자연스럽게 보정.
  React.useEffect(() => {
    setBudget(DEFAULT_BUDGET_BY_KIND[dealKind]);
  }, [dealKind]);

  const togglePriority = (p: Priority) => {
    setPriorities((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const range = BUDGET_RANGE[dealKind];

  const recommendations = React.useMemo<Recommendation[] | null>(() => {
    if (!submitted) return null;
    const input: MatcherInput = {
      rank,
      family,
      dealKind,
      budgetManwon: budget,
      priorities: [...priorities],
    };
    return rankRecommendations({
      input,
      complexes,
      marketStats,
    }).slice(0, 6);
  }, [submitted, rank, family, dealKind, budget, priorities, complexes, marketStats]);

  return (
    <div className="space-y-10">
      <Card className="overflow-hidden">
        <CardContent className="space-y-6 p-6 md:p-8">
          <SectionHeader title="1. 직급 / 연차" />
          <RadioRow<Rank>
            options={(Object.keys(MATCHER_LABELS.rank) as Rank[]).map((v) => ({
              value: v,
              label: MATCHER_LABELS.rank[v],
            }))}
            value={rank}
            onChange={setRank}
          />

          <SectionHeader title="2. 가족 구성" />
          <RadioRow<Family>
            options={(Object.keys(MATCHER_LABELS.family) as Family[]).map(
              (v) => ({ value: v, label: MATCHER_LABELS.family[v] })
            )}
            value={family}
            onChange={setFamily}
          />

          <SectionHeader title="3. 거래 유형" />
          <RadioRow<DealKind>
            options={[
              { value: "trade", label: "매매" },
              { value: "rent_jeonse", label: "전세" },
              { value: "rent_monthly", label: "월세" },
            ]}
            value={dealKind}
            onChange={setDealKind}
          />

          <div>
            <SectionHeader
              title={
                dealKind === "trade"
                  ? "4. 매매 예산"
                  : dealKind === "rent_jeonse"
                    ? "4. 전세 보증금 예산"
                    : "4. 월세 예산"
              }
              suffix={
                <span className="font-semibold text-foreground tabular-nums">
                  {dealKind === "rent_monthly"
                    ? `${budget.toLocaleString("ko-KR")}만원/월`
                    : formatManwon(budget, { unit: "auto" })}
                </span>
              }
            />
            <input
              type="range"
              min={range.min}
              max={range.max}
              step={range.step}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="mt-3 w-full accent-primary"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>
                {dealKind === "rent_monthly"
                  ? `${range.min}만원`
                  : formatManwon(range.min)}
              </span>
              <span>
                {dealKind === "rent_monthly"
                  ? `${range.max}만원`
                  : formatManwon(range.max)}
              </span>
            </div>
          </div>

          <div>
            <SectionHeader title="5. 우선순위 (복수 선택)" />
            <div className="flex flex-wrap gap-2">
              {(Object.keys(MATCHER_LABELS.priority) as Priority[]).map((p) => {
                const active = priorities.has(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePriority(p)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-secondary"
                    )}
                  >
                    {MATCHER_LABELS.priority[p]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button size="lg" onClick={() => setSubmitted(true)}>
              매칭 결과 보기
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            {submitted && (
              <Button
                size="lg"
                variant="ghost"
                onClick={() => setSubmitted(false)}
              >
                조건 수정
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {submitted && recommendations && (
        <ResultsSection
          recommendations={recommendations}
          dealKind={dealKind}
        />
      )}
    </div>
  );
}

function ResultsSection({
  recommendations,
  dealKind,
}: {
  recommendations: Recommendation[];
  dealKind: DealKind;
}) {
  if (recommendations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center text-sm text-muted-foreground">
        조건에 맞는 추천을 찾지 못했습니다. 예산을 조정해보세요.
      </div>
    );
  }

  const topScore = recommendations[0].score;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            RESULTS
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
            점수 순 추천 ({recommendations.length}건)
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          점수는 평형 적합도(35%) + 예산 적합도(30%) + 우선순위 매칭(35%)의
          가중 평균입니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {recommendations.map((r, i) => (
          <Card
            key={`${r.complexId}-${r.sizePyeong}`}
            className={cn(
              "transition-colors",
              i === 0 && "border-primary/50"
            )}
          >
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={i === 0 ? "default" : "secondary"}
                      className="font-semibold"
                    >
                      #{i + 1}
                    </Badge>
                    <h3 className="text-lg font-semibold leading-tight">
                      {r.shortName} · {formatPyeong(r.sizePyeong)}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {r.complexName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold tabular-nums leading-none text-primary">
                    {r.score}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    /{topScore === 100 ? "100" : "100"}
                  </p>
                </div>
              </div>

              {r.estimatedPriceManwon != null && (
                <div className="rounded-lg bg-secondary/60 px-4 py-3 text-sm">
                  <p className="text-xs font-medium text-muted-foreground">
                    {dealKind === "trade"
                      ? "평균 매매가 (최근 36개월)"
                      : dealKind === "rent_jeonse"
                        ? "추정 전세 보증금 (매매가의 70%)"
                        : "월세 추정"}
                  </p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums">
                    {formatManwon(r.estimatedPriceManwon, { unit: "auto" })}
                    {r.sampleCount > 0 && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        · 표본 {formatCount(r.sampleCount)}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {r.reasons.length > 0 && (
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5" />
                    추천 근거
                  </p>
                  <ul className="space-y-1">
                    {r.reasons.map((reason, idx) => (
                      <li key={idx} className="text-sm leading-relaxed">
                        · {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {r.cautions.length > 0 && (
                <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    참고 사항
                  </p>
                  <ul className="space-y-1">
                    {r.cautions.map((c, idx) => (
                      <li
                        key={idx}
                        className="text-sm leading-relaxed text-foreground/80"
                      >
                        · {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={`/tools/compare?complex=${r.complexId}&size=${r.sizePyeong}`}
                  >
                    비교 대시보드에서 보기
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/contact">
                    <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                    상담 요청
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 text-sm">
        <p className="font-medium">
          더 정확한 매칭이 필요하시다면 {siteConfig.agent.name} 공인중개사와
          직접 상담하세요.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          이 매칭은 룰 기반 점수입니다. 실제 매물 가용성, 층/향, 학교 배정
          최신 현황은 운영자가 직접 확인합니다.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/contact">
              <MessageCircle className="mr-1.5 h-4 w-4" />
              운영자에게 상담 요청
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a href={`tel:${siteConfig.contact.phoneTel}`}>
              {siteConfig.contact.phone}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  title,
  suffix,
}: {
  title: string;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      {suffix}
    </div>
  );
}

function RadioRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            value === opt.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-foreground hover:bg-secondary"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

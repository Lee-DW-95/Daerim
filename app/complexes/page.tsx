import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Calendar, Users } from "lucide-react";

import { listComplexes } from "@/lib/data/complexes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "단지 안내",
  description:
    "청주 지웰시티 1차·2차·3차 단지별 핵심 정보·시세·매물 hub. 단지를 선택하면 자세한 정보로 이동합니다.",
};

export default function ComplexesIndexPage() {
  const complexes = listComplexes();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <header className="mb-10 max-w-2xl space-y-2">
        <p className="text-sm font-medium text-primary">COMPLEXES</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          청주 지웰시티 단지 안내
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
          단지별 핵심 정보, 평형별 시세 추이, 같은 단지 매물·관련 글까지 한
          페이지에서 확인하실 수 있습니다.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {complexes.map((c) => (
            <Link
              key={c.id}
              href={`/complexes/${c.id}`}
              className="group block"
            >
              <Card className="h-full transition-colors group-hover:border-primary/40">
                <CardContent className="space-y-4 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{c.type}</Badge>
                    {c.buildYear && (
                      <Badge variant="outline">{c.buildYear}년 입주</Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {c.shortName}
                    </p>
                    <h2 className="mt-1 text-xl font-bold leading-tight">
                      {c.name}
                    </h2>
                  </div>
                  {c.tagline && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {c.tagline}
                    </p>
                  )}
                  <ul className="space-y-1.5 text-sm">
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        입주 {c.buildYear ?? "정보 미공개"}
                        {c.buildYear ? "년" : ""}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        {c.households
                          ? `${c.households.toLocaleString("ko-KR")}세대`
                          : "세대수 미공개"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>
                        평형{" "}
                        {c.sizes.length > 0
                          ? c.sizes.map((s) => `${s}평`).join(" · ")
                          : "정보 미공개"}
                      </span>
                    </li>
                  </ul>
                  <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
                    단지 페이지 보기
                    <ArrowRight className="ml-0.5 h-3.5 w-3.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
      </div>
    </div>
  );
}

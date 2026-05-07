import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { toolsNav } from "@/lib/site-config";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "도구",
  description: "지웰시티 단지 비교, 실거래가 추이, 하이닉스 매칭, 시뮬레이터.",
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <header className="mb-10 max-w-2xl">
        <p className="text-sm font-medium text-primary">TOOLS</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
          데이터로 결정하는 도구 모음
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          매물 카드 100개 보는 것보다, 단지 1개를 깊게 비교하는 게 결정에 도움이
          됩니다. Sprint 2~3에서 순차 공개됩니다.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {toolsNav.map((tool) => (
          <Card key={tool.href} className="transition-colors hover:border-primary/40">
            <CardContent className="flex h-full flex-col gap-3 p-6">
              <h2 className="text-lg font-semibold leading-tight">{tool.title}</h2>
              {tool.description && (
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              )}
              <Link
                href={tool.href}
                className="mt-auto inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                도구 보기
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

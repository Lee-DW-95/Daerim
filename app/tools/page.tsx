import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { toolsNav } from "@/lib/site-config";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "도구",
  description: "지웰시티 단지 비교, 시세 추이, 하이닉스 매칭, 시뮬레이터.",
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <PageHeader
        eyebrow="TOOLS"
        title="데이터로 결정하는 도구 모음"
        description="매물 카드 100개를 보는 것보다 단지 1개를 깊게 비교하는 게 결정에 도움이 됩니다."
      />

      <div className="grid gap-5 md:grid-cols-2">
        {toolsNav.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group block">
            <Card className="card-lift h-full border-border/80">
              <CardContent className="flex h-full flex-col gap-3 p-7">
                <h2 className="text-lg font-semibold leading-tight tracking-tight md:text-xl">
                  {tool.title}
                </h2>
                {tool.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {tool.description}
                  </p>
                )}
                <span className="mt-auto inline-flex items-center text-sm font-medium text-primary">
                  도구 보기
                  <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

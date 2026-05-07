import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { count: totalCount } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true });
  const { count: availableCount } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "available");
  const { count: pendingCount } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  const { count: soldCount } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "sold");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          매물 현황 한눈에 보기.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="전체" value={totalCount ?? 0} />
        <StatCard label="거래 가능" value={availableCount ?? 0} accent />
        <StatCard label="협상 중" value={pendingCount ?? 0} />
        <StatCard label="거래 완료" value={soldCount ?? 0} muted />
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold">매물 관리</p>
                <p className="text-xs text-muted-foreground">
                  새 매물 등록·수정·삭제·사진 업로드
                </p>
              </div>
            </div>
            <Button asChild size="sm">
              <Link href="/admin/listings">
                이동
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-xl border border-dashed border-border bg-secondary/40 p-5 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">앞으로 들어올 메뉴</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>매물 알림 구독자 명단</li>
          <li>방문자 행동 로그 (대시보드 차트)</li>
          <li>실거래가 일별 누적 (cron)</li>
          <li>단지 메타데이터 보강 (사용자 입력 → DB)</li>
        </ul>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: number;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-card p-4 ${
        accent ? "border-primary/40" : "border-border"
      }`}
    >
      <p
        className={`text-xs font-medium uppercase tracking-wide ${
          accent ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-bold tabular-nums ${
          muted ? "text-muted-foreground" : ""
        }`}
      >
        {value.toLocaleString("ko-KR")}
      </p>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, Building2, Inbox } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const [
    { count: totalCount },
    { count: availableCount },
    { count: pendingCount },
    { count: soldCount },
    { count: contactsCount },
    { count: newContactsCount },
  ] = await Promise.all([
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "available"),
    supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "sold"),
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          매물·문의 현황 한눈에 보기.
        </p>
      </div>

      <section>
        <p className="eyebrow mb-3">LISTINGS</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="전체" value={totalCount ?? 0} />
          <StatCard label="거래 가능" value={availableCount ?? 0} accent />
          <StatCard label="협상 중" value={pendingCount ?? 0} />
          <StatCard label="거래 완료" value={soldCount ?? 0} muted />
        </div>
      </section>

      <section>
        <p className="eyebrow mb-3">CONTACTS</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="전체 문의" value={contactsCount ?? 0} />
          <StatCard label="신규" value={newContactsCount ?? 0} accent />
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <NavCard
          icon={<Building2 className="h-5 w-5" />}
          title="매물 관리"
          description="새 매물 등록·수정·삭제·사진 업로드"
          href="/admin/listings"
        />
        <NavCard
          icon={<Inbox className="h-5 w-5" />}
          title="문의 관리"
          description="공개 폼으로 받은 문의 확인·답변·보관"
          href="/admin/contacts"
          badge={newContactsCount ? `신규 ${newContactsCount}` : undefined}
        />
      </section>

      <section className="rounded-xl border border-dashed border-border bg-secondary/40 p-5 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">앞으로 들어올 메뉴</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>매물 알림 구독자 (문의 폼과 별개로 자동 push)</li>
          <li>방문자 행동 로그 (대시보드 차트)</li>
          <li>실거래가 일별 누적 (cron)</li>
        </ul>
      </section>
    </div>
  );
}

function NavCard({
  icon,
  title,
  description,
  href,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  badge?: string;
}) {
  return (
    <Card className="card-lift">
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold">{title}</p>
              {badge && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button asChild size="sm">
          <Link href={href}>
            이동
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
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

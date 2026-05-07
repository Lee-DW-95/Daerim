import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, LayoutDashboard, Building2, ArrowLeft } from "lucide-react";

import {
  createSupabaseServerClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { signOutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: { default: "어드민", template: "%s · 어드민" },
  robots: { index: false, follow: false },
};

// 인증 세션 기반이라 모든 어드민 페이지를 동적 렌더링.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="mb-3 text-2xl font-bold tracking-tight">
          Supabase 설정이 필요합니다
        </h1>
        <p className="text-sm text-muted-foreground">
          어드민을 사용하려면 Supabase 프로젝트를 생성하고 환경변수
          (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)를
          등록해야 합니다. 자세한 절차는 저장소의{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5">SUPABASE_SETUP.md</code>{" "}
          를 참고하세요.
        </p>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-base font-semibold tracking-tight"
          >
            어드민
          </Link>
          {user && (
            <nav className="hidden items-center gap-1 text-sm md:flex">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                대시보드
              </Link>
              <Link
                href="/admin/listings"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Building2 className="h-3.5 w-3.5" />
                매물 관리
              </Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              사이트로
            </Link>
          </Button>
          {user && (
            <>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {user.email}
              </span>
              <form action={signOutAction}>
                <Button type="submit" variant="outline" size="sm">
                  <LogOut className="mr-1 h-3.5 w-3.5" />
                  로그아웃
                </Button>
              </form>
            </>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}

import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "어드민 로그인",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12 md:py-20">
      <div className="w-full space-y-6">
        <div className="space-y-2">
          <p className="eyebrow">ADMIN</p>
          <h1 className="text-3xl font-bold leading-[1.1] tracking-tight">
            어드민 로그인
          </h1>
          <p className="text-sm text-muted-foreground">
            운영자 전용 페이지입니다. 등록된 이메일로만 접근 가능합니다.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <LoginForm redirectTo={redirectTo ?? "/admin"} />
        </div>
      </div>
    </div>
  );
}

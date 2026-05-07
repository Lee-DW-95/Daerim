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
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-12 md:py-16">
      <div className="w-full">
        <h1 className="mb-2 text-2xl font-bold tracking-tight">어드민 로그인</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          운영자 전용 페이지입니다. 등록된 이메일로만 접근 가능합니다.
        </p>
        <LoginForm redirectTo={redirectTo ?? "/admin"} />
      </div>
    </div>
  );
}

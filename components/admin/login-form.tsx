"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { publicEnv } from "@/lib/env";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // 진단용 — 클라이언트 번들에 인라인된 환경변수 값을 마스킹해서 표시
  const diagnostic = React.useMemo(() => {
    const url = publicEnv.supabaseUrl;
    const key = publicEnv.supabaseAnonKey;
    return {
      url: url ?? "(미설정)",
      urlLength: url?.length ?? 0,
      urlValid:
        !!url &&
        url.startsWith("https://") &&
        url.endsWith(".supabase.co") &&
        !/[\s"']/.test(url),
      keyLength: key?.length ?? 0,
      keyStarts: key?.slice(0, 10) ?? "—",
      keyEnds: key?.slice(-5) ?? "—",
      isJwt: key?.startsWith("eyJ") ?? false,
      hasInvalidChar: !!key && /[\s"']/.test(key),
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 진단 — 콘솔에 클라이언트가 사용할 값 출력
    // eslint-disable-next-line no-console
    console.log("[diagnostic] supabase env at submit:", diagnostic);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(translateAuthError(error.message));
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "로그인 중..." : "로그인"}
      </Button>

      <details className="mt-4 rounded-md border border-border bg-secondary/40 p-3 text-xs">
        <summary className="cursor-pointer font-medium text-muted-foreground">
          🔧 환경변수 진단 (배포 후 삭제 예정)
        </summary>
        <dl className="mt-3 space-y-1.5 font-mono text-[11px]">
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">URL</dt>
            <dd className="break-all text-right">{diagnostic.url}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">URL 길이</dt>
            <dd>{diagnostic.urlLength}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">URL 형식 OK</dt>
            <dd className={diagnostic.urlValid ? "text-emerald-600" : "text-destructive"}>
              {diagnostic.urlValid ? "✓ 정상" : "✗ 비정상 (https://...supabase.co가 아님 또는 invalid 문자)"}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">ANON_KEY 길이</dt>
            <dd>{diagnostic.keyLength}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">ANON_KEY 시작</dt>
            <dd>{diagnostic.keyStarts}…</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">ANON_KEY 끝</dt>
            <dd>…{diagnostic.keyEnds}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">JWT 형식</dt>
            <dd className={diagnostic.isJwt ? "text-emerald-600" : "text-destructive"}>
              {diagnostic.isJwt ? "✓ eyJ로 시작" : "✗ JWT 아님 (publishable_key 잘못 입력?)"}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">invalid 문자</dt>
            <dd className={diagnostic.hasInvalidChar ? "text-destructive" : "text-emerald-600"}>
              {diagnostic.hasInvalidChar ? "✗ 공백/따옴표 포함" : "✓ 깨끗"}
            </dd>
          </div>
        </dl>
      </details>
    </form>
  );
}

function translateAuthError(message: string): string {
  if (message.includes("Invalid login credentials"))
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  if (message.includes("Email not confirmed"))
    return "이메일 인증이 필요합니다. Supabase Studio에서 사용자를 확인해주세요.";
  return message;
}

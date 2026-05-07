import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * 세션 토큰을 갱신하고, /admin 경로에 미인증 접근 시 /admin/login 으로 리다이렉트.
 *
 * Supabase 환경변수가 미설정이면 어드민 보호도 의미가 없으므로 그대로 통과시킵니다
 * (개발 초기 단계에서 사이트 페이지가 깨지지 않도록).
 *
 * publicEnv를 통해 환경변수가 sanitize(trim·따옴표 제거·protocol 보정)된 상태로
 * 들어오므로 Vercel 입력 실수가 미들웨어를 throw 시키지 않습니다.
 */
export async function updateSession(request: NextRequest) {
  const url = publicEnv.supabaseUrl;
  const anonKey = publicEnv.supabaseAnonKey;
  if (!url || !anonKey) return NextResponse.next();

  // 미들웨어 자체가 환경변수 입력 실수로 떨어지지 않도록 모든 supabase 호출을
  // try/catch로 감쌉니다. 인증 실패는 미인증으로 간주하고 페이지 통과시킵니다.
  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient<Database>(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isAdmin = pathname.startsWith("/admin");
    const isLogin = pathname === "/admin/login";

    if (isAdmin && !isLogin && !user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 이미 로그인된 사용자가 로그인 페이지에 가면 어드민 홈으로
    if (isLogin && user) {
      const adminUrl = request.nextUrl.clone();
      adminUrl.pathname = "/admin";
      adminUrl.searchParams.delete("redirectTo");
      return NextResponse.redirect(adminUrl);
    }

    return response;
  } catch (err) {
    console.error("[middleware] supabase 세션 처리 실패 — 미인증으로 통과:", err);
    return response;
  }
}

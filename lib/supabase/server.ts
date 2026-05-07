import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * 서버 컴포넌트 / Server Action / Route Handler에서 사용하는 Supabase 클라이언트.
 * 쿠키 기반 세션을 따라가서 RLS의 auth.role() = 'authenticated' 정책이 동작합니다.
 */
export async function createSupabaseServerClient() {
  const url = publicEnv.supabaseUrl;
  const anonKey = publicEnv.supabaseAnonKey;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase 환경변수가 설정되지 않았습니다 (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    );
  }

  const cookieStore = await cookies();
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // RSC에서 호출되면 set이 막히는데, 미들웨어가 세션 갱신을 처리하므로 무시 가능.
        }
      },
    },
  });
}

/**
 * Supabase 환경변수 존재 여부. 미설정 시 데이터 fetch 단계에서 빈 배열로 fallback.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}

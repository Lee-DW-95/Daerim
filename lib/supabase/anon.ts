import "server-only";

import { createClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * 쿠키/세션 없이 anon 키로만 동작하는 Supabase 클라이언트.
 *
 * 사용 시점:
 * - generateStaticParams (빌드 타임, HTTP request 컨텍스트 없음)
 * - generateMetadata (정적 페이지)
 * - 일반 server component에서 RLS public read 정책으로 충분한 데이터
 *
 * 운영자 권한이 필요한 작업(매물 CUD)은 createSupabaseServerClient를
 * 사용해 쿠키 기반 세션을 따라가야 합니다.
 */

let cached: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAnonClient(): ReturnType<
  typeof createClient<Database>
> | null {
  if (cached) return cached;

  const url = publicEnv.supabaseUrl;
  const anonKey = publicEnv.supabaseAnonKey;
  if (!url || !anonKey) return null;

  cached = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cached;
}

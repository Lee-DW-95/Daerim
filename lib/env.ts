/**
 * 환경변수 typed accessor.
 *
 * - 서버 전용 키(MOLIT_API_KEY)는 클라이언트 번들에 노출되지 않습니다.
 * - 클라이언트 키(NEXT_PUBLIC_*)는 Next.js가 빌드 타임에 인라인합니다.
 * - 키가 없을 때 사용 시점에 빠르게 실패하도록 helper를 제공합니다.
 */

export const serverEnv = {
  /** 국토교통부 아파트 매매 OpenAPI Decoding 키. */
  molitApiKey: process.env.MOLIT_API_KEY,
  /** 국토교통부 아파트 전월세 OpenAPI 키 (별도 사용신청 필요). */
  molitPartApiKey: process.env.MOLIT_PART_API_KEY,
  /** 국토교통부 오피스텔 매매·전월세 OpenAPI 키. */
  molitOfficeApiKey: process.env.MOLIT_OFFICE_API_KEY,
  /**
   * Supabase service role 키. RLS를 우회하므로 절대 클라이언트에 노출 금지.
   * 일반적인 매물 fetch는 anon 키만으로 충분합니다.
   */
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
} as const;

export const publicEnv = {
  /** 카카오 지도 JavaScript API 키. 도메인 화이트리스트 필수. */
  kakaoMapKey: process.env.NEXT_PUBLIC_KAKAO_MAP_KEY,
  /** Google Analytics 4 측정 ID. 비어있으면 GA 미동작. 예: "G-XXXXXXXXXX". */
  gaId: process.env.NEXT_PUBLIC_GA_ID,
  /** 네이버 서치어드바이저 사이트 인증 토큰. */
  naverVerification: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION,
  /** 구글 서치 콘솔 사이트 인증 토큰. */
  googleVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  /** Supabase 프로젝트 URL. https://<project>.supabase.co */
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  /** Supabase anon (public) key. RLS 정책으로 보호됨. */
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const;

export function requireServerEnv<K extends keyof typeof serverEnv>(
  key: K
): NonNullable<(typeof serverEnv)[K]> {
  const value = serverEnv[key];
  if (!value) {
    throw new Error(
      `Missing server env: ${String(
        key
      )}. .env.local 또는 Vercel 환경변수에 등록하세요.`
    );
  }
  return value as NonNullable<(typeof serverEnv)[K]>;
}

export function requirePublicEnv<K extends keyof typeof publicEnv>(
  key: K
): NonNullable<(typeof publicEnv)[K]> {
  const value = publicEnv[key];
  if (!value) {
    throw new Error(
      `Missing public env: NEXT_PUBLIC_${String(
        key
      ).toUpperCase()}. .env.local 또는 Vercel 환경변수에 등록하세요.`
    );
  }
  return value as NonNullable<(typeof publicEnv)[K]>;
}

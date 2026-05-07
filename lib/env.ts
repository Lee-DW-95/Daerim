/**
 * 환경변수 typed accessor.
 *
 * - 서버 전용 키(MOLIT_API_KEY 등)는 클라이언트 번들에 노출되지 않습니다.
 * - 클라이언트 키(NEXT_PUBLIC_*)는 Next.js가 빌드 타임에 인라인합니다.
 * - 환경변수 입력 시 흔한 실수(앞뒤 공백·개행·따옴표·protocol 누락)를
 *   방어적으로 sanitize 합니다. Vercel 입력란에서 보이지 않게 들어간
 *   문자가 fetch invalid value 에러를 유발하는 문제 방지.
 */

/**
 * 환경변수 값에서 모든 공백(스페이스·개행·탭)과 따옴표를 제거합니다.
 *
 * 단순 trim이 아니라 **모든 위치의 공백 제거**: Vercel 입력란에 긴 JWT 키를
 * 붙여넣을 때 자동 줄바꿈이 시각적으로만 보이는 게 아니라 실제 \n으로
 * 들어가는 케이스를 잡습니다. URL·API key·JWT는 내부에 공백이 없으므로
 * 안전하게 제거 가능합니다.
 */
function clean(v: string | undefined): string | undefined {
  if (v == null) return undefined;
  const cleaned = v.replace(/\s/g, "").replace(/["'`]/g, "");
  return cleaned.length > 0 ? cleaned : undefined;
}

/** URL 형식 보정 — protocol 누락 시 https:// 자동 추가. */
function cleanUrl(v: string | undefined): string | undefined {
  const cleaned = clean(v);
  if (!cleaned) return undefined;
  if (!/^https?:\/\//.test(cleaned)) return `https://${cleaned}`;
  return cleaned;
}

export const serverEnv = {
  /** 국토교통부 아파트 매매 OpenAPI Decoding 키. */
  molitApiKey: clean(process.env.MOLIT_API_KEY),
  /** 국토교통부 아파트 전월세 OpenAPI 키 (별도 사용신청 필요). */
  molitPartApiKey: clean(process.env.MOLIT_PART_API_KEY),
  /** 국토교통부 오피스텔 매매·전월세 OpenAPI 키. */
  molitOfficeApiKey: clean(process.env.MOLIT_OFFICE_API_KEY),
  /**
   * Supabase service role 키. RLS를 우회하므로 절대 클라이언트에 노출 금지.
   * 일반적인 매물 fetch는 anon 키만으로 충분합니다.
   */
  supabaseServiceRoleKey: clean(process.env.SUPABASE_SERVICE_ROLE_KEY),
} as const;

export const publicEnv = {
  /** 카카오 지도 JavaScript API 키. 도메인 화이트리스트 필수. */
  kakaoMapKey: clean(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY),
  /** Google Analytics 4 측정 ID. 비어있으면 GA 미동작. 예: "G-XXXXXXXXXX". */
  gaId: clean(process.env.NEXT_PUBLIC_GA_ID),
  /** 네이버 서치어드바이저 사이트 인증 토큰. */
  naverVerification: clean(process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION),
  /** 구글 서치 콘솔 사이트 인증 토큰. */
  googleVerification: clean(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION),
  /** Supabase 프로젝트 URL. https://<project>.supabase.co */
  supabaseUrl: cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
  /** Supabase anon (public) key. RLS 정책으로 보호됨. */
  supabaseAnonKey: clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
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

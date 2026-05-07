/**
 * 환경변수 typed accessor.
 *
 * - 서버 전용 키(MOLIT_API_KEY)는 클라이언트 번들에 노출되지 않습니다.
 * - 클라이언트 키(NEXT_PUBLIC_*)는 Next.js가 빌드 타임에 인라인합니다.
 * - 키가 없을 때 사용 시점에 빠르게 실패하도록 helper를 제공합니다.
 */

export const serverEnv = {
  /** 국토교통부 실거래가 OpenAPI Decoding 키. */
  molitApiKey: process.env.MOLIT_API_KEY,
} as const;

export const publicEnv = {
  /** 카카오 지도 JavaScript API 키. 도메인 화이트리스트 필수. */
  kakaoMapKey: process.env.NEXT_PUBLIC_KAKAO_MAP_KEY,
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

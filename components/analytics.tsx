import Script from "next/script";

import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { publicEnv } from "@/lib/env";

/**
 * 분석 스택:
 * - Vercel Analytics: 페이지 뷰·웹 비탈 자동 수집 (Vercel 무료 플랜 포함)
 * - Vercel Speed Insights: Core Web Vitals 측정
 * - GA4: NEXT_PUBLIC_GA_ID 설정 시에만 활성화 (선택 사항)
 *
 * 모두 클라이언트에서만 동작하며, RSC layout.tsx에서 임포트해도 안전합니다.
 */
export function Analytics() {
  const gaId = publicEnv.gaId;

  return (
    <>
      <VercelAnalytics />
      <SpeedInsights />
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}
    </>
  );
}

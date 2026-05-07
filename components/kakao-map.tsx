"use client";

import * as React from "react";
import Script from "next/script";
import { Map, MapMarker } from "react-kakao-maps-sdk";

import { publicEnv } from "@/lib/env";

type Props = {
  lat: number;
  lng: number;
  /** 1(가까움) ~ 14(멀음). 기본 4. */
  level?: number;
  /** 마커 위에 띄울 짧은 라벨. */
  markerLabel?: string;
  /** 지도 외부 컨테이너에 줄 className (높이 등). */
  className?: string;
  /** 지도 우상단에 "카카오맵으로 보기" 링크 보일지. 기본 true. */
  showOpenInKakaoLink?: boolean;
};

declare global {
  interface Window {
    kakao?: {
      maps?: {
        load: (cb: () => void) => void;
      };
    };
  }
}

export function KakaoMap({
  lat,
  lng,
  level = 4,
  markerLabel,
  className,
  showOpenInKakaoLink = true,
}: Props) {
  const appkey = publicEnv.kakaoMapKey;
  const [loaded, setLoaded] = React.useState(false);
  const [scriptError, setScriptError] = React.useState(false);

  // 페이지가 http(localhost)이든 https(production)이든 항상 https로 SDK 로드.
  // 카카오는 최근 http SDK 호출을 거부하므로 protocol-relative를 쓰면 안 됩니다.
  const sdkSrc = appkey
    ? `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&libraries=services&autoload=false`
    : null;

  const handleScriptReady = React.useCallback(() => {
    if (typeof window === "undefined" || !window.kakao?.maps?.load) {
      setScriptError(true);
      return;
    }
    window.kakao.maps.load(() => setLoaded(true));
  }, []);

  const containerClass = `relative h-full w-full overflow-hidden rounded-lg border ${
    loaded ? "border-border" : "border-dashed border-border bg-secondary/40"
  } ${className ?? ""}`;

  if (!appkey) {
    return (
      <div className={containerClass}>
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          카카오 지도 키가 설정되지 않았습니다 (NEXT_PUBLIC_KAKAO_MAP_KEY).
        </div>
      </div>
    );
  }

  return (
    <>
      {sdkSrc && (
        <Script
          src={sdkSrc}
          strategy="afterInteractive"
          onReady={handleScriptReady}
          onLoad={handleScriptReady}
          onError={() => setScriptError(true)}
        />
      )}
      <div className={containerClass}>
        {scriptError ? (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
            지도 로드 실패. 카카오 디벨로퍼스의 JavaScript SDK 도메인에 현재
            주소가 등록되어 있는지 확인해주세요.
          </div>
        ) : !loaded ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            지도 불러오는 중...
          </div>
        ) : (
          <>
            <Map
              center={{ lat, lng }}
              level={level}
              style={{ width: "100%", height: "100%" }}
            >
              <MapMarker position={{ lat, lng }}>
                {markerLabel && (
                  <div className="px-2 py-1 text-xs font-medium text-foreground">
                    {markerLabel}
                  </div>
                )}
              </MapMarker>
            </Map>
            {showOpenInKakaoLink && (
              <a
                href={`https://map.kakao.com/link/map/${encodeURIComponent(
                  markerLabel ?? "위치"
                )},${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-2 top-2 rounded-md bg-background/90 px-2 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur hover:bg-background"
              >
                카카오맵으로 열기
              </a>
            )}
          </>
        )}
      </div>
    </>
  );
}

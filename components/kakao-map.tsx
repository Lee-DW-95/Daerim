"use client";

import * as React from "react";
import Script from "next/script";
import { Map, MapMarker } from "react-kakao-maps-sdk";

import { publicEnv } from "@/lib/env";

type Props = {
  /**
   * 도로명 주소. 지정되면 SDK 로딩 후 카카오 Geocoder로 좌표를 자동
   * 변환합니다. 변환 실패 시 lat/lng로 fallback.
   */
  address?: string;
  /** 명시적 좌표. address가 없거나 변환 실패 시 사용됩니다. */
  lat?: number;
  lng?: number;
  /** 1(가까움) ~ 14(멀음). 기본 4. */
  level?: number;
  /** 마커 위에 띄울 짧은 라벨. */
  markerLabel?: string;
  /** 지도 외부 컨테이너에 줄 className (높이 등). */
  className?: string;
  /** 지도 우상단에 "카카오맵으로 보기" 링크 보일지. 기본 true. */
  showOpenInKakaoLink?: boolean;
};

type Coords = { lat: number; lng: number };

// react-kakao-maps-sdk가 자체 window.kakao 타입을 정의해 충돌하므로
// 필요한 부분만 unknown으로 narrow 해서 사용합니다.
type GeocoderResult = { x: string; y: string };
type Geocoder = {
  addressSearch: (
    address: string,
    callback: (result: GeocoderResult[], status: string) => void
  ) => void;
};
type KakaoMapsBridge = {
  load: (cb: () => void) => void;
  services?: {
    Geocoder: new () => Geocoder;
    Status: { OK: string };
  };
};

function getKakaoMaps(): KakaoMapsBridge | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { kakao?: { maps?: KakaoMapsBridge } };
  return w.kakao?.maps ?? null;
}

export function KakaoMap({
  address,
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
  const [resolved, setResolved] = React.useState<Coords | null>(
    lat != null && lng != null ? { lat, lng } : null
  );

  const sdkSrc = appkey
    ? `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&libraries=services&autoload=false`
    : null;

  const handleScriptReady = React.useCallback(() => {
    const maps = getKakaoMaps();
    if (!maps?.load) {
      setScriptError(true);
      return;
    }
    maps.load(() => setLoaded(true));
  }, []);

  // address가 있으면 Geocoder로 좌표 변환. 실패 시 props lat/lng가 살아있음.
  React.useEffect(() => {
    if (!loaded || !address) return;
    const services = getKakaoMaps()?.services;
    if (!services?.Geocoder) return;

    const geocoder = new services.Geocoder();
    geocoder.addressSearch(address, (result, status) => {
      if (status === services.Status.OK && result.length > 0) {
        setResolved({
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x),
        });
      }
    });
  }, [loaded, address]);

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
        ) : !loaded || !resolved ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            지도 불러오는 중...
          </div>
        ) : (
          <>
            <Map
              center={resolved}
              level={level}
              style={{ width: "100%", height: "100%" }}
            >
              <MapMarker position={resolved}>
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
                  markerLabel ?? address ?? "위치"
                )},${resolved.lat},${resolved.lng}`}
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

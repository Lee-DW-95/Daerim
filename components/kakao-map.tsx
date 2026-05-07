"use client";

import * as React from "react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

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

export function KakaoMap({
  lat,
  lng,
  level = 4,
  markerLabel,
  className,
  showOpenInKakaoLink = true,
}: Props) {
  const appkey = publicEnv.kakaoMapKey;

  const [loading, error] = useKakaoLoader({
    appkey: appkey ?? "",
    libraries: ["services"],
  });

  if (!appkey) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center rounded-lg border border-dashed border-border bg-secondary/40 text-sm text-muted-foreground ${className ?? ""}`}
      >
        카카오 지도 키가 설정되지 않았습니다 (NEXT_PUBLIC_KAKAO_MAP_KEY).
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center rounded-lg border border-dashed border-border bg-secondary/40 text-sm text-muted-foreground ${className ?? ""}`}
      >
        지도 로드 실패. 카카오 디벨로퍼스에 현재 도메인이 등록되어 있는지
        확인해주세요.
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center rounded-lg border border-border bg-secondary/40 text-sm text-muted-foreground ${className ?? ""}`}
      >
        지도 불러오는 중...
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden rounded-lg border border-border ${className ?? ""}`}>
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
          href={`https://map.kakao.com/link/map/${encodeURIComponent(markerLabel ?? "위치")},${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-2 top-2 rounded-md bg-background/90 px-2 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur hover:bg-background"
        >
          카카오맵으로 열기
        </a>
      )}
    </div>
  );
}

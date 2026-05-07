import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site-config";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

const NAVY = "#0f1b2d";
const GOLD = "#c9a961";
const SURFACE = "#ffffff";
const TEXT_MUTED = "#94a3b8";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? siteConfig.tagline;
  const eyebrow = searchParams.get("category") ?? siteConfig.shortName;
  const subtitle = searchParams.get("subtitle") ?? siteConfig.description;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: NAVY,
          padding: "72px 80px",
          color: SURFACE,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: GOLD,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: GOLD,
              color: NAVY,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            {siteConfig.shortName}
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div
          style={{
            marginTop: 56,
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: -1,
            display: "flex",
          }}
        >
          {title.length > 60 ? title.slice(0, 60) + "…" : title}
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            lineHeight: 1.4,
            color: TEXT_MUTED,
            display: "flex",
          }}
        >
          {subtitle.length > 110 ? subtitle.slice(0, 110) + "…" : subtitle}
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ fontSize: 20, color: TEXT_MUTED }}>
              {siteConfig.agent.name} 공인중개사
            </div>
            <div style={{ fontSize: 20, color: TEXT_MUTED }}>
              {siteConfig.agent.specialty}
            </div>
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: GOLD,
              display: "flex",
            }}
          >
            daerim.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

import "./globals.css";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://daerim.com"),
  title: {
    default: "지웰대림공인중개사 · 청주 지웰시티 전문",
    template: "%s · 지웰대림공인중개사",
  },
  description:
    "청주 지웰시티 1·2·3차와 롯데 오피스텔 전담. 11년차 공인중개사 이명숙이 데이터로 단지 비교, 시세 분석, SK하이닉스 직원 매물 매칭까지 안내합니다.",
  keywords: [
    "지웰시티",
    "지웰시티 1차",
    "지웰시티 2차",
    "지웰시티 3차",
    "청주 부동산",
    "복대동 아파트",
    "SK하이닉스 청주",
    "하이닉스 청주 전세",
    "롯데 오피스텔 청주",
  ],
  authors: [{ name: "이명숙" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "지웰대림공인중개사",
    title: "지웰대림공인중개사 · 청주 지웰시티 전문",
    description:
      "청주 지웰시티 1·2·3차 전담. 데이터로 비교하고, 솔직하게 안내합니다.",
    images: ["/og?title=지웰대림공인중개사&subtitle=청주 지웰시티 전문, 데이터로 증명합니다."],
  },
  twitter: {
    card: "summary_large_image",
    title: "지웰대림공인중개사 · 청주 지웰시티 전문",
    description:
      "청주 지웰시티 1·2·3차 전담. 데이터로 비교하고, 솔직하게 안내합니다.",
    images: ["/og?title=지웰대림공인중개사&subtitle=청주 지웰시티 전문, 데이터로 증명합니다."],
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${jetBrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}

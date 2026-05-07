import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const kakao = siteConfig.contact.kakaoChannelUrl;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 md:h-16 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
          aria-label={`${siteConfig.name} 홈으로`}
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
            {siteConfig.shortName}
          </span>
          <span className="hidden sm:inline-block text-base">
            {siteConfig.name}
          </span>
        </Link>

        <div className="ml-4 hidden md:block">
          <MainNav />
        </div>

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          {kakao ? (
            <Button
              asChild
              size="sm"
              className="hidden sm:inline-flex bg-[#FEE500] text-black hover:bg-[#FFD700]"
            >
              <a
                href={kakao}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="카카오톡 채널로 문의"
              >
                <MessageCircle className="mr-1 h-4 w-4" />
                카톡 문의
              </a>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="hidden sm:inline-flex"
            >
              <Link href="/contact" aria-label="문의 페이지로 이동">
                <MessageCircle className="mr-1 h-4 w-4" />
                문의
              </Link>
            </Button>
          )}

          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

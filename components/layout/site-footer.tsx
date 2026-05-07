import Link from "next/link";
import { Phone, MapPin, Clock } from "lucide-react";

import { siteConfig, mainNav } from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                {siteConfig.shortName}
              </span>
              <p className="text-base font-semibold tracking-tight">
                {siteConfig.name}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {siteConfig.agent.name} 공인중개사 ·{" "}
              {siteConfig.agent.yearsOfExperience}년차
              <br />
              {siteConfig.agent.specialty}
            </p>
            {siteConfig.agent.licenseNumber && (
              <p className="text-xs text-muted-foreground tabular-nums">
                등록번호 {siteConfig.agent.licenseNumber}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <p className="eyebrow">CONTACT</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <a
                  href={`tel:${siteConfig.contact.phoneTel}`}
                  className="font-medium tabular-nums text-foreground hover:underline"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="leading-relaxed">
                  {siteConfig.contact.officeAddress}
                </span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="leading-relaxed">
                  {siteConfig.contact.officeHours}
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="eyebrow">SITEMAP</p>
            <ul className="grid grid-cols-2 gap-y-2 text-sm">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p className="leading-relaxed">
            본 사이트의 시세·실거래가 정보는 참고용이며 실제 거래 가격과 다를
            수 있습니다. 거래 전 운영자에게 직접 확인하세요.
          </p>
        </div>
      </div>
    </footer>
  );
}

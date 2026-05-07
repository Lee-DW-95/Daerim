import Link from "next/link";

import { siteConfig, mainNav } from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
        <div className="space-y-2">
          <p className="text-base font-semibold text-foreground">
            {siteConfig.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {siteConfig.agent.name} 공인중개사 · {siteConfig.agent.specialty}
          </p>
          <p className="text-sm text-muted-foreground">
            {siteConfig.agent.yearsOfExperience}년차 / 청주 흥덕구 복대동
          </p>
          {siteConfig.agent.licenseNumber && (
            <p className="text-xs text-muted-foreground">
              등록번호 {siteConfig.agent.licenseNumber}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">연락처</p>
          <p className="text-sm">
            <a
              href={`tel:${siteConfig.contact.phoneTel}`}
              className="text-foreground hover:underline"
            >
              {siteConfig.contact.phone}
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            {siteConfig.contact.officeAddress}
          </p>
          <p className="text-xs text-muted-foreground">
            {siteConfig.contact.officeHours}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">바로가기</p>
          <ul className="grid grid-cols-2 gap-1 text-sm">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
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

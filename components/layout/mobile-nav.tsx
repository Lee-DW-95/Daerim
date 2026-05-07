"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  mainNav,
  toolsNav,
  complexesNav,
  siteConfig,
} from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  const close = () => setOpen(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="메뉴 열기"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[80%] sm:w-[360px]">
        <SheetHeader className="text-left">
          <SheetTitle className="text-base font-semibold">
            {siteConfig.name}
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-2 flex flex-col gap-1 px-2">
          {mainNav.map((item) => (
            <React.Fragment key={item.href}>
              <Link
                href={item.href}
                onClick={close}
                className={cn(
                  "rounded-md px-3 py-2 text-base font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-secondary text-primary"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.title}
              </Link>
              {(item.href === "/tools" || item.href === "/complexes") && (
                <ul className="ml-3 mb-1 flex flex-col gap-0.5 border-l border-border pl-3">
                  {(item.href === "/tools" ? toolsNav : complexesNav).map(
                    (sub) => (
                      <li key={sub.href}>
                        <Link
                          href={sub.href}
                          onClick={close}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm transition-colors",
                            isActive(sub.href)
                              ? "text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {sub.title}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              )}
            </React.Fragment>
          ))}
        </nav>

        <Separator className="my-4" />

        <div className="flex flex-col gap-2 px-4 text-sm text-muted-foreground">
          <a
            href={`tel:${siteConfig.contact.phoneTel}`}
            className="font-medium text-foreground"
          >
            {siteConfig.contact.phone}
          </a>
          <p className="text-xs leading-relaxed">
            {siteConfig.contact.officeAddress}
          </p>
          <p className="text-xs">{siteConfig.contact.officeHours}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

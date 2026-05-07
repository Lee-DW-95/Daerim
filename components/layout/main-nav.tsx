"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { mainNav, toolsNav, complexesNav } from "@/lib/site-config";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function MainNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {mainNav.map((item) => {
          const dropdownItems =
            item.href === "/tools"
              ? toolsNav
              : item.href === "/complexes"
                ? complexesNav
                : null;

          if (dropdownItems) {
            return (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuTrigger
                  className={cn(
                    isActive(item.href) && "text-primary font-semibold"
                  )}
                >
                  {item.title}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[360px] gap-2 p-3 md:w-[460px] md:grid-cols-2">
                    {dropdownItems.map((d) => (
                      <li key={d.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={d.href}
                            className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">
                              {d.title}
                            </div>
                            {d.description && (
                              <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
                                {d.description}
                              </p>
                            )}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          }

          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink asChild>
                <Link
                  href={item.href}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent",
                    isActive(item.href) && "text-primary font-semibold"
                  )}
                >
                  {item.title}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

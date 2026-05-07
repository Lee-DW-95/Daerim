"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { mainNav, toolsNav } from "@/lib/site-config";
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
          if (item.href === "/tools") {
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
                  <ul className="grid w-[420px] gap-2 p-3 md:w-[520px] md:grid-cols-2">
                    {toolsNav.map((tool) => (
                      <li key={tool.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={tool.href}
                            className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">
                              {tool.title}
                            </div>
                            {tool.description && (
                              <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
                                {tool.description}
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

import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site-config";
import { listListings } from "@/lib/data/listings";
import { listComplexes } from "@/lib/data/complexes";
import { getAllPosts, getUsedCategories, getUsedTags } from "@/lib/mdx";
import { toolsNav } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  const staticPaths = [
    "",
    "/about",
    "/contact",
    "/tools",
    "/complexes",
    "/listings",
    "/blog",
  ];

  const items: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  for (const tool of toolsNav) {
    items.push({
      url: `${base}${tool.href}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const complex of listComplexes()) {
    items.push({
      url: `${base}/complexes/${complex.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const listing of await listListings()) {
    items.push({
      url: `${base}/listings/${listing.slug}`,
      lastModified: new Date(listing.publishedAt),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const post of getAllPosts()) {
    items.push({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const c of getUsedCategories()) {
    items.push({
      url: `${base}/blog/category/${encodeURIComponent(c)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  for (const { tag } of getUsedTags()) {
    items.push({
      url: `${base}/blog/tag/${encodeURIComponent(tag)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.4,
    });
  }

  return items;
}

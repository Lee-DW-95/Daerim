import listingsJson from "@/data/listings.json";

import type { Listing } from "@/lib/types/listing";

export const listings = listingsJson as Listing[];

export function listListings(): Listing[] {
  return [...listings].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
}

export function getListing(slug: string): Listing | undefined {
  return listings.find((l) => l.slug === slug);
}

export function listListingSlugs(): string[] {
  return listings.map((l) => l.slug);
}

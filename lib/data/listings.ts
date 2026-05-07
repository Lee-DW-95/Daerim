import "server-only";

import { getSupabaseAnonClient } from "@/lib/supabase/anon";
import type { ListingRow } from "@/lib/supabase/types";
import type { Listing } from "@/lib/types/listing";

import legacyListingsJson from "@/data/listings.json";

const legacyListings = legacyListingsJson as Listing[];

/**
 * Supabase row → 도메인 모델(Listing) 변환.
 * snake_case ↔ camelCase 매핑을 한 곳에 모아둡니다.
 */
function rowToListing(row: ListingRow): Listing {
  return {
    slug: row.slug,
    complexId: row.complex_id as Listing["complexId"],
    dealKind: row.deal_kind,
    sizePyeong: row.size_pyeong,
    exclusiveAreaSqm: row.exclusive_area_sqm ?? undefined,
    currentFloor: row.current_floor,
    totalFloor: row.total_floor ?? undefined,
    direction: row.direction,
    priceManwon: row.price_manwon,
    monthlyRentManwon: row.monthly_rent_manwon ?? undefined,
    availableFrom: row.available_from,
    status: row.status,
    publishedAt: row.published_at,
    headline: row.headline,
    agentNote: row.agent_note,
    pros: row.pros ?? [],
    cons: row.cons ?? [],
    features: row.features ?? [],
    images: row.images ?? [],
  };
}

async function fetchListings(): Promise<Listing[]> {
  const supabase = getSupabaseAnonClient();
  // Supabase 미구성 시 JSON 시드를 fallback으로 사용 (개발 초기 단계 안전망).
  if (!supabase) {
    return [...legacyListings];
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.warn(
      "[listings] Supabase fetch 실패 — JSON fallback:",
      error.message
    );
    return [...legacyListings];
  }

  return (data ?? []).map(rowToListing);
}

export async function listListings(): Promise<Listing[]> {
  return fetchListings();
}

export async function getListing(slug: string): Promise<Listing | undefined> {
  const all = await fetchListings();
  return all.find((l) => l.slug === slug);
}

export async function listListingSlugs(): Promise<string[]> {
  const all = await fetchListings();
  return all.map((l) => l.slug);
}

/**
 * Supabase DB row 타입.
 *
 * supabase gen types를 사용하지 않고 수동으로 유지합니다.
 * (테이블이 1개뿐이라 자동화 가치 적음. 추후 확장 시 supabase CLI 도입 검토.)
 */

export type ListingRow = {
  id: string;
  slug: string;
  complex_id: string;
  deal_kind: "trade" | "jeonse" | "monthly";
  size_pyeong: number;
  exclusive_area_sqm: number | null;
  current_floor: number;
  total_floor: number | null;
  direction:
    | "south"
    | "southeast"
    | "southwest"
    | "east"
    | "west"
    | "north";
  price_manwon: number;
  monthly_rent_manwon: number | null;
  available_from: string;
  status: "available" | "pending" | "sold";
  published_at: string;
  headline: string;
  agent_note: string;
  pros: string[];
  cons: string[];
  features: string[];
  images: string[];
  created_at: string;
  updated_at: string;
};

export type ListingInsert = Omit<
  ListingRow,
  "id" | "created_at" | "updated_at" | "published_at"
> & {
  published_at?: string;
};

export type ListingUpdate = Partial<ListingInsert>;

export type Database = {
  public: {
    Tables: {
      listings: {
        Row: ListingRow;
        Insert: ListingInsert;
        Update: ListingUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

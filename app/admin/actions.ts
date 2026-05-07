"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import type {
  ListingInsert,
  ListingUpdate,
} from "@/lib/supabase/types";

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

function revalidateListings(slug?: string, complexId?: string) {
  revalidatePath("/");
  revalidatePath("/listings");
  if (slug) revalidatePath(`/listings/${slug}`);
  if (complexId) revalidatePath(`/complexes/${complexId}`);
  revalidatePath("/admin/listings");
}

function fail(message: string): { ok: false; error: string } {
  return { ok: false, error: message };
}

function ok<T>(data?: T): { ok: true; data?: T } {
  return { ok: true, data };
}

function parseStringList(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseListingFromForm(
  form: FormData
): { ok: true; insert: ListingInsert } | { ok: false; error: string } {
  const slug = String(form.get("slug") ?? "").trim();
  const complex_id = String(form.get("complex_id") ?? "").trim();
  const deal_kind = String(form.get("deal_kind") ?? "") as ListingInsert["deal_kind"];
  const direction = String(form.get("direction") ?? "") as ListingInsert["direction"];
  const status = String(form.get("status") ?? "available") as ListingInsert["status"];
  const headline = String(form.get("headline") ?? "").trim();
  const agent_note = String(form.get("agent_note") ?? "").trim();
  const available_from = String(form.get("available_from") ?? "").trim() || "즉시";

  const size_pyeong = Number(form.get("size_pyeong"));
  const current_floor = Number(form.get("current_floor"));
  const price_manwon = Number(form.get("price_manwon"));

  if (!slug) return { ok: false, error: "slug는 필수입니다." };
  if (!/^[a-z0-9-]+$/.test(slug))
    return { ok: false, error: "slug는 소문자·숫자·하이픈만 가능합니다." };
  if (!complex_id) return { ok: false, error: "단지를 선택하세요." };
  if (!headline) return { ok: false, error: "한 줄 요약(headline)은 필수입니다." };
  if (!Number.isFinite(size_pyeong) || size_pyeong <= 0)
    return { ok: false, error: "평형(size_pyeong)을 입력하세요." };
  if (!Number.isFinite(current_floor))
    return { ok: false, error: "현재 층을 입력하세요." };
  if (!Number.isFinite(price_manwon) || price_manwon <= 0)
    return { ok: false, error: "가격(price_manwon)을 입력하세요." };

  const totalFloorRaw = form.get("total_floor");
  const total_floor =
    totalFloorRaw && String(totalFloorRaw).trim() !== ""
      ? Number(totalFloorRaw)
      : null;
  const exclusiveRaw = form.get("exclusive_area_sqm");
  const exclusive_area_sqm =
    exclusiveRaw && String(exclusiveRaw).trim() !== ""
      ? Number(exclusiveRaw)
      : null;
  const monthlyRaw = form.get("monthly_rent_manwon");
  const monthly_rent_manwon =
    monthlyRaw && String(monthlyRaw).trim() !== ""
      ? Number(monthlyRaw)
      : null;

  const imagesJson = form.get("images_json");
  let images: string[] = [];
  if (typeof imagesJson === "string" && imagesJson.trim() !== "") {
    try {
      const parsed = JSON.parse(imagesJson);
      if (Array.isArray(parsed)) images = parsed.filter((s) => typeof s === "string");
    } catch {
      // 잘못된 JSON은 무시 (UI에서 사진 업로드를 통해서만 채워지는 필드)
    }
  }

  const insert: ListingInsert = {
    slug,
    complex_id,
    deal_kind,
    size_pyeong,
    exclusive_area_sqm,
    current_floor,
    total_floor,
    direction,
    price_manwon,
    monthly_rent_manwon,
    available_from,
    status,
    headline,
    agent_note,
    pros: parseStringList(form.get("pros")),
    cons: parseStringList(form.get("cons")),
    features: parseStringList(form.get("features")),
    images,
  };
  return { ok: true, insert };
}

export async function createListingAction(_: unknown, form: FormData) {
  const parsed = parseListingFromForm(form);
  if (!parsed.ok) return fail(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("listings").insert(parsed.insert);
  if (error) return fail(error.message);

  revalidateListings(parsed.insert.slug, parsed.insert.complex_id);
  redirect("/admin/listings");
}

export async function updateListingAction(_: unknown, form: FormData) {
  const id = String(form.get("id") ?? "").trim();
  if (!id) return fail("id가 필요합니다.");

  const parsed = parseListingFromForm(form);
  if (!parsed.ok) return fail(parsed.error);

  const supabase = await createSupabaseServerClient();
  const update: ListingUpdate = parsed.insert;
  const { error } = await supabase
    .from("listings")
    .update(update)
    .eq("id", id);
  if (error) return fail(error.message);

  revalidateListings(parsed.insert.slug, parsed.insert.complex_id);
  redirect("/admin/listings");
}

export async function deleteListingAction(form: FormData) {
  const id = String(form.get("id") ?? "").trim();
  if (!id) return;
  const slug = String(form.get("slug") ?? "");
  const complexId = String(form.get("complex_id") ?? "");

  const supabase = await createSupabaseServerClient();
  await supabase.from("listings").delete().eq("id", id);
  revalidateListings(slug, complexId);
  redirect("/admin/listings");
}

export async function uploadListingImageAction(
  formData: FormData
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const file = formData.get("file");
  const slug = String(formData.get("slug") ?? "general");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "파일이 비어있습니다." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: "5MB 이하 이미지만 업로드 가능합니다." };
  }

  const supabase = await createSupabaseServerClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${slug}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("listing-images")
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type || undefined,
    });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

export async function deleteListingImageAction(
  url: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  // public URL → bucket 내 path로 역추적
  const marker = "/storage/v1/object/public/listing-images/";
  const idx = url.indexOf(marker);
  if (idx === -1) return { ok: false, error: "공개 URL 형식이 아닙니다." };
  const path = url.slice(idx + marker.length);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage
    .from("listing-images")
    .remove([path]);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export type ListingActionResult =
  | { ok: true; data?: unknown }
  | { ok: false; error: string };

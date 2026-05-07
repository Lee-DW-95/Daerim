"use server";

import { getSupabaseAnonClient } from "@/lib/supabase/anon";
import type { ContactInsert } from "@/lib/supabase/types";

export type SubmitContactResult =
  | { ok: true }
  | { ok: false; error: string };

const PHONE_REGEX = /^[\d\-+\s()]{8,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactAction(
  _prev: SubmitContactResult | null,
  form: FormData
): Promise<SubmitContactResult> {
  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const emailRaw = String(form.get("email") ?? "").trim();
  const email = emailRaw.length > 0 ? emailRaw : null;
  const complexId = String(form.get("interested_complex_id") ?? "").trim();
  const dealKindRaw = String(form.get("deal_kind") ?? "").trim();
  const sizePyeongRaw = String(form.get("size_pyeong") ?? "").trim();
  const budgetRaw = String(form.get("budget_manwon") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();
  const agreed = form.get("agreed") === "on" || form.get("agreed") === "true";

  if (name.length < 2) return { ok: false, error: "성함을 2자 이상 입력해주세요." };
  if (name.length > 40) return { ok: false, error: "성함이 너무 깁니다." };
  if (!PHONE_REGEX.test(phone))
    return {
      ok: false,
      error: "연락처 형식이 올바르지 않습니다 (예: 010-1234-5678).",
    };
  if (email && !EMAIL_REGEX.test(email))
    return { ok: false, error: "이메일 형식이 올바르지 않습니다." };
  if (message.length < 5)
    return { ok: false, error: "문의 내용을 5자 이상 작성해주세요." };
  if (message.length > 2000)
    return { ok: false, error: "문의 내용이 너무 깁니다 (2000자 제한)." };
  if (!agreed)
    return {
      ok: false,
      error: "개인정보 처리 방침에 동의하셔야 문의가 접수됩니다.",
    };

  const dealKind: ContactInsert["deal_kind"] =
    dealKindRaw === "trade" ||
    dealKindRaw === "jeonse" ||
    dealKindRaw === "monthly"
      ? dealKindRaw
      : null;

  const sizePyeong = sizePyeongRaw
    ? Number.parseInt(sizePyeongRaw, 10)
    : null;
  const budget = budgetRaw ? Number.parseInt(budgetRaw, 10) : null;

  const supabase = getSupabaseAnonClient();
  if (!supabase) {
    return {
      ok: false,
      error: "서버 설정 문제로 문의를 받지 못합니다. 운영자에게 직접 연락해주세요.",
    };
  }

  const insert: ContactInsert = {
    name,
    phone,
    email,
    interested_complex_id: complexId.length > 0 ? complexId : null,
    deal_kind: dealKind,
    size_pyeong: Number.isFinite(sizePyeong) ? sizePyeong : null,
    budget_manwon: Number.isFinite(budget) ? budget : null,
    message,
  };

  const { error } = await supabase.from("contacts").insert(insert);
  if (error) {
    console.warn("[contact] submit failed:", error.message);
    return {
      ok: false,
      error: "문의 저장 중 문제가 생겼습니다. 잠시 후 다시 시도해주세요.",
    };
  }

  return { ok: true };
}

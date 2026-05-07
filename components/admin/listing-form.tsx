"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Trash2, Upload, Image as ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createListingAction,
  updateListingAction,
  uploadListingImageAction,
  deleteListingImageAction,
  type ListingActionResult,
} from "@/app/admin/actions";
import { complexes } from "@/lib/data/complexes";
import {
  DEAL_KIND_LABEL,
  DIRECTION_LABEL,
  STATUS_LABEL,
  type ListingDealKind,
  type ListingDirection,
  type ListingStatus,
} from "@/lib/types/listing";

import type { ListingRow } from "@/lib/supabase/types";

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  initial?: ListingRow;
};

export function ListingForm({ mode, initial }: Props) {
  const action = mode === "create" ? createListingAction : updateListingAction;
  const [state, formAction] = useFormState<ListingActionResult, FormData>(
    action,
    { ok: true }
  );

  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [images, setImages] = React.useState<string[]>(initial?.images ?? []);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const onUpload = async (file: File) => {
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slug", slug || "untitled");
      const result = await uploadListingImageAction(fd);
      if (result.ok) {
        setImages((prev) => [...prev, result.url]);
      } else {
        setUploadError(result.error);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onRemoveImage = async (url: string) => {
    if (!window.confirm("이 사진을 삭제할까요?")) return;
    setImages((prev) => prev.filter((u) => u !== url));
    await deleteListingImageAction(url);
  };

  return (
    <form action={formAction} className="space-y-8">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="images_json" value={JSON.stringify(images)} />

      {/* 기본 정보 */}
      <Section title="기본 정보">
        <Field label="슬러그 (URL)" hint="소문자/숫자/하이픈만. 예: jiwell-1-49-trade-2026-06">
          <Input
            name="slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="jiwell-1-49-trade-2026-06"
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="단지">
            <select
              name="complex_id"
              required
              defaultValue={initial?.complex_id ?? "jiwell-1"}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {complexes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.shortName} · {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="거래 유형">
            <select
              name="deal_kind"
              required
              defaultValue={initial?.deal_kind ?? "trade"}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {(Object.keys(DEAL_KIND_LABEL) as ListingDealKind[]).map((k) => (
                <option key={k} value={k}>
                  {DEAL_KIND_LABEL[k]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="한 줄 요약">
          <Input
            name="headline"
            required
            defaultValue={initial?.headline ?? ""}
            placeholder="지웰시티 1차 49평 남향 고층"
          />
        </Field>
      </Section>

      {/* 평형·층·향 */}
      <Section title="평형·층·향">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="평형 (한국식)">
            <Input
              name="size_pyeong"
              type="number"
              required
              min={10}
              defaultValue={initial?.size_pyeong ?? 49}
            />
          </Field>
          <Field label="전용면적 (㎡)" hint="선택">
            <Input
              name="exclusive_area_sqm"
              type="number"
              step="0.01"
              defaultValue={initial?.exclusive_area_sqm ?? ""}
            />
          </Field>
          <Field label="향">
            <select
              name="direction"
              required
              defaultValue={initial?.direction ?? "south"}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {(Object.keys(DIRECTION_LABEL) as ListingDirection[]).map((d) => (
                <option key={d} value={d}>
                  {DIRECTION_LABEL[d]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="현재 층">
            <Input
              name="current_floor"
              type="number"
              required
              defaultValue={initial?.current_floor ?? 1}
            />
          </Field>
          <Field label="총 층수" hint="선택">
            <Input
              name="total_floor"
              type="number"
              defaultValue={initial?.total_floor ?? ""}
            />
          </Field>
        </div>
      </Section>

      {/* 가격·일정·상태 */}
      <Section title="가격 · 입주 · 상태">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="가격 (만원)" hint="매매가 · 전세 보증금 · 월세 보증금">
            <Input
              name="price_manwon"
              type="number"
              required
              min={0}
              defaultValue={initial?.price_manwon ?? 0}
            />
          </Field>
          <Field label="월세 (만원)" hint="월세 거래일 때만">
            <Input
              name="monthly_rent_manwon"
              type="number"
              min={0}
              defaultValue={initial?.monthly_rent_manwon ?? ""}
            />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="입주 가능일" hint='"즉시" 또는 "2026-07-01" 형식'>
            <Input
              name="available_from"
              required
              defaultValue={initial?.available_from ?? "즉시"}
            />
          </Field>
          <Field label="상태">
            <select
              name="status"
              required
              defaultValue={initial?.status ?? "available"}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {(Object.keys(STATUS_LABEL) as ListingStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* 텍스트 영역 */}
      <Section title="설명 · 강점 · 약점 · 옵션">
        <Field label="운영자 코멘트" hint="이 매물의 솔직한 평가">
          <textarea
            name="agent_note"
            required
            rows={4}
            defaultValue={initial?.agent_note ?? ""}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="이 매물의 강점과 약점을 솔직하게 작성하세요."
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="강점 (한 줄에 하나씩)">
            <textarea
              name="pros"
              rows={5}
              defaultValue={initial?.pros?.join("\n") ?? ""}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder={"32층 남향\n솔밭초 도보 5분"}
            />
          </Field>
          <Field label="약점 (한 줄에 하나씩)">
            <textarea
              name="cons"
              rows={5}
              defaultValue={initial?.cons?.join("\n") ?? ""}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder={"도배 교체 권장\n주차 부족"}
            />
          </Field>
          <Field label="옵션·시설 (한 줄에 하나씩)">
            <textarea
              name="features"
              rows={5}
              defaultValue={initial?.features?.join("\n") ?? ""}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder={"발코니 확장\n시스템 에어컨"}
            />
          </Field>
        </div>
      </Section>

      {/* 사진 */}
      <Section title="사진">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f);
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="mr-1 h-4 w-4" />
              {uploading ? "업로드 중..." : "사진 추가"}
            </Button>
            <span className="text-xs text-muted-foreground">
              5MB 이하 / 한 번에 한 장
            </span>
          </div>
          {uploadError && (
            <p className="text-sm text-destructive">{uploadError}</p>
          )}
          {images.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border bg-secondary/40 text-sm text-muted-foreground">
              <ImageIcon className="mr-2 h-4 w-4" />
              사진 없음 — 추가하면 첫 사진이 대표 이미지로 사용됩니다.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {images.map((url, idx) => (
                <div
                  key={url}
                  className="relative aspect-square overflow-hidden rounded-lg border border-border"
                >
                  <img
                    src={url}
                    alt={`업로드된 사진 ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      대표
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveImage(url)}
                    className="absolute right-1 top-1 rounded bg-destructive/80 p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive"
                    style={{ opacity: 1 }}
                    aria-label="사진 삭제"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      {!state.ok && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          저장 실패: {state.error}
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}

function SubmitButton({ mode }: { mode: Mode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "저장 중..." : mode === "create" ? "등록" : "수정 저장"}
    </Button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-5 md:p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const id = React.useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {hint && (
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {hint}
          </span>
        )}
      </Label>
      <div>{React.isValidElement<{ id?: string }>(children) ? React.cloneElement(children, { id }) : children}</div>
    </div>
  );
}

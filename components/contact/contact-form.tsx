"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { complexes } from "@/lib/data/complexes";
import {
  submitContactAction,
  type SubmitContactResult,
} from "@/app/contact/actions";

export function ContactForm() {
  const [state, formAction] = useFormState<
    SubmitContactResult | null,
    FormData
  >(submitContactAction, null);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  if (state?.ok) {
    return (
      <Card className="border-primary/40 bg-primary/5">
        <CardContent className="space-y-3 p-8 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
          <h3 className="text-xl font-bold tracking-tight">
            문의가 접수됐습니다
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            운영자가 곧 연락드립니다. 평일·주말 영업 시간 내 빠르게 답변드릴게요.
            바쁘신 경우 카카오톡·전화로도 연락 가능합니다.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            새 문의 작성하기
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="성함" required>
          <Input name="name" required minLength={2} maxLength={40} placeholder="홍길동" />
        </Field>
        <Field label="연락처" required hint="010-1234-5678">
          <Input
            name="phone"
            required
            inputMode="tel"
            placeholder="010-1234-5678"
          />
        </Field>
      </div>

      <Field label="이메일" hint="선택">
        <Input
          name="email"
          type="email"
          placeholder="example@example.com"
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="관심 단지" hint="선택">
          <select
            name="interested_complex_id"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="">선택 안 함</option>
            {complexes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.shortName} · {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="거래 유형" hint="선택">
          <select
            name="deal_kind"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="">선택 안 함</option>
            <option value="trade">매매</option>
            <option value="jeonse">전세</option>
            <option value="monthly">월세</option>
          </select>
        </Field>
        <Field label="평형" hint="선택, 숫자만">
          <Input
            name="size_pyeong"
            type="number"
            min={10}
            max={150}
            placeholder="49"
          />
        </Field>
      </div>

      <Field label="예산 (만원)" hint="선택. 매매/전세는 보증금">
        <Input
          name="budget_manwon"
          type="number"
          min={0}
          step={1000}
          placeholder="80000"
        />
      </Field>

      <Field label="문의 내용" required>
        <textarea
          name="message"
          required
          minLength={5}
          maxLength={2000}
          rows={5}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="원하시는 조건·궁금한 점·연락 가능 시간 등을 자유롭게 적어주세요."
        />
      </Field>

      <label className="flex items-start gap-2 rounded-md border border-border bg-secondary/30 p-3 text-xs leading-relaxed text-muted-foreground">
        <input
          type="checkbox"
          name="agreed"
          required
          className="mt-0.5 h-4 w-4 accent-primary"
        />
        <span>
          개인정보 수집·이용에 동의합니다. 수집한 성함·연락처·문의 내용은
          상담 목적으로만 사용되며, 별도 요청이 없는 한 1년 후 자동 삭제됩니다.
        </span>
      </label>

      {state && !state.ok && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "보내는 중..." : "문의 보내기"}
    </Button>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const id = React.useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center gap-1.5">
        {label}
        {required && <span className="text-destructive">*</span>}
        {hint && (
          <span className="text-xs font-normal text-muted-foreground">
            {hint}
          </span>
        )}
      </Label>
      <div>
        {React.isValidElement<{ id?: string }>(children)
          ? React.cloneElement(children, { id })
          : children}
      </div>
    </div>
  );
}

import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ContactRowActions } from "@/components/admin/contact-row-actions";
import { complexes } from "@/lib/data/complexes";

const STATUS_LABEL: Record<string, string> = {
  new: "신규",
  read: "확인함",
  replied: "답변완료",
  archived: "보관",
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  new: "default",
  read: "secondary",
  replied: "outline",
  archived: "outline",
};

const DEAL_LABEL: Record<string, string> = {
  trade: "매매",
  jeonse: "전세",
  monthly: "월세",
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminContactsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  const newCount = (data ?? []).filter((c) => c.status === "new").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">문의 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            운영자에게 들어온 문의 {data?.length ?? 0}건
            {newCount > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                신규 {newCount}건
              </span>
            )}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          문의 조회 실패: {error.message}
        </div>
      )}

      {(data ?? []).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-12 text-center text-sm text-muted-foreground">
          접수된 문의가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((c) => {
            const complex = c.interested_complex_id
              ? complexes.find((x) => x.id === c.interested_complex_id)
              : null;
            return (
              <div
                key={c.id}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={STATUS_VARIANT[c.status]}>
                      {STATUS_LABEL[c.status]}
                    </Badge>
                    <span className="text-base font-semibold">{c.name}</span>
                    <a
                      href={`tel:${c.phone}`}
                      className="text-sm tabular-nums text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {c.phone}
                    </a>
                    {c.email && (
                      <a
                        href={`mailto:${c.email}`}
                        className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                      >
                        {c.email}
                      </a>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {dateFormatter.format(new Date(c.created_at))}
                  </span>
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {complex && (
                    <span>
                      관심 단지 ·{" "}
                      <Link
                        href={`/complexes/${complex.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {complex.shortName}
                      </Link>
                    </span>
                  )}
                  {c.deal_kind && (
                    <span>
                      거래 ·{" "}
                      <span className="font-medium text-foreground">
                        {DEAL_LABEL[c.deal_kind]}
                      </span>
                    </span>
                  )}
                  {c.size_pyeong && (
                    <span>
                      평형 ·{" "}
                      <span className="font-medium text-foreground">
                        {c.size_pyeong}평
                      </span>
                    </span>
                  )}
                  {c.budget_manwon && (
                    <span>
                      예산 ·{" "}
                      <span className="font-medium text-foreground tabular-nums">
                        {c.budget_manwon.toLocaleString("ko-KR")}만원
                      </span>
                    </span>
                  )}
                </div>

                <p className="whitespace-pre-wrap rounded-lg bg-secondary/40 p-3 text-sm leading-relaxed">
                  {c.message}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    동의 시점:{" "}
                    {dateFormatter.format(new Date(c.agreed_at))}
                    {c.replied_at && (
                      <span className="ml-2">
                        · 답변 완료:{" "}
                        {dateFormatter.format(new Date(c.replied_at))}
                      </span>
                    )}
                  </p>
                  <ContactRowActions id={c.id} status={c.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

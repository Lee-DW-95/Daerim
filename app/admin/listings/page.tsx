import Link from "next/link";
import { Plus } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListingDeleteButton } from "@/components/admin/listing-delete-button";
import { complexes } from "@/lib/data/complexes";
import { DEAL_KIND_LABEL, STATUS_LABEL } from "@/lib/types/listing";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export default async function AdminListingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("published_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">매물 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            등록된 매물 {data?.length ?? 0}건. 최신순 정렬.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/listings/new">
            <Plus className="mr-1 h-4 w-4" />새 매물 등록
          </Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          매물 조회 실패: {error.message}
        </div>
      )}

      {(data ?? []).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center text-sm text-muted-foreground">
          등록된 매물이 없습니다. 우상단 버튼으로 첫 매물을 등록해주세요.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-3 text-left">상태</th>
                <th className="px-3 py-3 text-left">단지</th>
                <th className="px-3 py-3 text-left">유형</th>
                <th className="px-3 py-3 text-left">평형/층</th>
                <th className="px-3 py-3 text-right">가격</th>
                <th className="px-3 py-3 text-left">제목</th>
                <th className="px-3 py-3 text-left">등록일</th>
                <th className="px-3 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data ?? []).map((row) => {
                const complex = complexes.find((c) => c.id === row.complex_id);
                return (
                  <tr key={row.id} className="hover:bg-secondary/30">
                    <td className="px-3 py-3">
                      <Badge
                        variant={
                          row.status === "available"
                            ? "default"
                            : row.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {STATUS_LABEL[row.status]}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 font-medium">
                      {complex?.shortName ?? row.complex_id}
                    </td>
                    <td className="px-3 py-3">
                      {DEAL_KIND_LABEL[row.deal_kind]}
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      {row.size_pyeong}평 · {row.current_floor}
                      {row.total_floor ? `/${row.total_floor}` : ""}층
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {row.price_manwon.toLocaleString("ko-KR")}
                    </td>
                    <td className="px-3 py-3 max-w-[280px] truncate" title={row.headline}>
                      {row.headline}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">
                      {dateFormatter.format(new Date(row.published_at))}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/listings/${row.slug}`} target="_blank">
                            보기
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/listings/${row.id}/edit`}>
                            편집
                          </Link>
                        </Button>
                        <ListingDeleteButton
                          id={row.id}
                          slug={row.slug}
                          complexId={row.complex_id}
                          headline={row.headline}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

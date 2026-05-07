"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteListingAction } from "@/app/admin/actions";

type Props = {
  id: string;
  slug: string;
  complexId: string;
  headline: string;
};

export function ListingDeleteButton({ id, slug, complexId, headline }: Props) {
  return (
    <form
      action={deleteListingAction}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `"${headline}" 매물을 삭제할까요? 되돌릴 수 없습니다.`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="complex_id" value={complexId} />
      <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </form>
  );
}

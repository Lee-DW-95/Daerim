"use client";

import * as React from "react";
import { useTransition } from "react";
import { Trash2, Eye, MessageCircleReply, Archive } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  updateContactStatusAction,
  deleteContactAction,
} from "@/app/admin/contact-actions";

import type { ContactStatus } from "@/lib/supabase/types";

type Props = {
  id: string;
  status: ContactStatus;
};

export function ContactRowActions({ id, status }: Props) {
  const [pending, startTransition] = useTransition();

  const setStatus = (next: ContactStatus) => {
    startTransition(async () => {
      await updateContactStatusAction(id, next);
    });
  };

  const onDelete = () => {
    if (!window.confirm("이 문의를 삭제할까요? 되돌릴 수 없습니다.")) return;
    startTransition(async () => {
      await deleteContactAction(id);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      {status !== "read" && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setStatus("read")}
          disabled={pending}
        >
          <Eye className="mr-1 h-3.5 w-3.5" />
          확인
        </Button>
      )}
      {status !== "replied" && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setStatus("replied")}
          disabled={pending}
        >
          <MessageCircleReply className="mr-1 h-3.5 w-3.5" />
          답변완료
        </Button>
      )}
      {status !== "archived" && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setStatus("archived")}
          disabled={pending}
        >
          <Archive className="mr-1 h-3.5 w-3.5" />
          보관
        </Button>
      )}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={onDelete}
        disabled={pending}
        className="text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

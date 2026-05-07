import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description?: string;
  /** 어느 Sprint에서 공개되는지 짧게 표시. */
  sprintLabel?: string;
  /** 위에서 보여줄 라벨 (예: "TOOLS"). */
  eyebrow?: string;
};

export function ComingSoon({ title, description, sprintLabel, eyebrow }: Props) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center md:py-32">
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h1 className="text-3xl font-bold leading-[1.1] tracking-tight md:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {description}
        </p>
      )}
      {sprintLabel && (
        <span className="mt-5 inline-flex items-center rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          {sprintLabel}
        </span>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            홈으로
          </Link>
        </Button>
        <Button asChild>
          <Link href="/contact">
            <MessageCircle className="mr-1.5 h-4 w-4" />
            바로 상담 문의
          </Link>
        </Button>
      </div>
    </div>
  );
}

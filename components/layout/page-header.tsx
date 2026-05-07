import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  /** Heading에 gradient-text 효과 적용. */
  gradient?: boolean;
  /** 헤더 우측에 들어가는 액션 (버튼·링크 등). */
  action?: React.ReactNode;
  className?: string;
};

/**
 * 모든 페이지 상단의 공통 헤더 — eyebrow + 큰 제목 + 설명 + 우측 액션.
 * 사이트 전반의 톤을 일관되게 유지합니다.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  gradient = false,
  action,
  className,
}: Props) {
  return (
    <header
      className={cn(
        "mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="max-w-2xl space-y-3">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1
          className={cn(
            "text-3xl font-bold leading-[1.1] tracking-tight md:text-4xl",
            gradient && "gradient-text"
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

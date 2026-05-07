import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PostSummary } from "@/lib/types/post";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function formatDate(iso: string): string {
  try {
    return dateFormatter.format(new Date(iso));
  } catch {
    return iso;
  }
}

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <Card className="card-lift h-full border-border/80">
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="border-primary/30 text-primary">
              {post.category}
            </Badge>
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatDate(post.date)}
            </span>
          </div>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug group-hover:text-primary">
            {post.title}
          </h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {post.description}
          </p>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

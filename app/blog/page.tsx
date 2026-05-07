import type { Metadata } from "next";
import Link from "next/link";

import { getAllPosts, getUsedCategories } from "@/lib/mdx";
import { PostCard } from "@/components/blog/post-card";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "블로그",
  description: "청주 지웰시티 단지 분석, 하이닉스 가이드, 시장 리포트.",
};

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getUsedCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <PageHeader
        eyebrow="BLOG"
        title="청주 부동산 인사이트"
        description="단지 분석, 하이닉스 발령자 가이드, 학군 정리, 분기 시장 리포트. 데이터로 풀어내는 부동산 글입니다."
      />

      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/blog"
            className="rounded-full border border-primary bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
          >
            전체
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/blog/category/${encodeURIComponent(c)}`}
              className="rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            아직 발행된 글이 없습니다. 곧 채워나갑니다.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}

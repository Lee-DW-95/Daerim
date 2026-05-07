import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getPostsByCategory, getUsedCategories } from "@/lib/mdx";
import { POST_CATEGORIES } from "@/lib/types/post";
import { PostCard } from "@/components/blog/post-card";

type Params = { slug: string };

export function generateStaticParams() {
  return getUsedCategories().map((c) => ({ slug: encodeURIComponent(c) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  return {
    title: `${decoded} 카테고리`,
    description: `청주 지웰시티 ${decoded} 관련 글 모음.`,
  };
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const category = decodeURIComponent(slug);
  if (!(POST_CATEGORIES as readonly string[]).includes(category)) notFound();

  const posts = getPostsByCategory(category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <Link
        href="/blog"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        블로그 전체
      </Link>

      <header className="mb-10 max-w-2xl space-y-2">
        <p className="text-sm font-medium text-primary">CATEGORY</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {category}
        </h1>
        <p className="text-sm text-muted-foreground">
          {posts.length}개의 글
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center text-sm text-muted-foreground">
          이 카테고리에 발행된 글이 없습니다.
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

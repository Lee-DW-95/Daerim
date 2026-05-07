import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getPostsByTag, getUsedTags } from "@/lib/mdx";
import { PostCard } from "@/components/blog/post-card";

type Params = { slug: string };

export function generateStaticParams() {
  return getUsedTags().map(({ tag }) => ({ slug: encodeURIComponent(tag) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  return {
    title: `#${decoded}`,
    description: `'${decoded}' 태그가 달린 글.`,
  };
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const tag = decodeURIComponent(slug);
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        블로그 전체
      </Link>

      <header className="mb-12 max-w-2xl space-y-3">
        <p className="eyebrow">TAG</p>
        <h1 className="text-3xl font-bold leading-[1.1] tracking-tight md:text-4xl">
          #{tag}
        </h1>
        <p className="text-sm text-muted-foreground">{posts.length}개의 글</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </div>
  );
}

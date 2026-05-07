import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";

import { getPost, listPostSlugs } from "@/lib/mdx";
import { siteConfig } from "@/lib/site-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MdxContent } from "@/components/mdx/mdx-content";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

type Params = { slug: string };

export function generateStaticParams() {
  return listPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "글을 찾을 수 없습니다" };

  const ogImage =
    post.ogImage ??
    `/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}`;

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      tags: post.tags,
      authors: post.author ? [post.author] : undefined,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        블로그 목록
      </Link>

      <header className="mb-12 space-y-5 border-b border-border pb-10">
        <div className="flex items-center gap-3">
          <Link href={`/blog/category/${encodeURIComponent(post.category)}`}>
            <Badge variant="outline" className="border-primary/30 text-primary shadow-sm">
              {post.category}
            </Badge>
          </Link>
          <span className="text-xs text-muted-foreground tabular-nums">
            {dateFormatter.format(new Date(post.date))}
          </span>
        </div>
        <h1 className="text-3xl font-bold leading-[1.15] tracking-tight md:text-5xl">
          {post.title}
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground md:text-xl">
          {post.description}
        </p>
        {(post.author || (post.tags && post.tags.length > 0)) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
            {post.author && (
              <span className="text-muted-foreground">
                글 · <span className="font-medium text-foreground">{post.author}</span>
              </span>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <Link
                    key={t}
                    href={`/blog/tag/${encodeURIComponent(t)}`}
                    className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground hover:text-foreground"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      <div className="prose-custom text-base leading-7">
        <MdxContent source={post.content} />
      </div>

      <Separator className="my-12" />

      <section className="relative overflow-hidden rounded-3xl border border-border bg-primary p-8 text-primary-foreground md:p-12">
        <div
          aria-hidden
          className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-gold/20 blur-3xl"
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
            Let&apos;s talk
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            상담이 필요하신가요?
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/70 md:text-base">
            글을 보고 궁금한 점이 생겼다면 운영자에게 직접 물어보세요.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              asChild
              size="lg"
              className="bg-brand-gold text-brand-gold-foreground shadow-lg hover:bg-brand-gold/90"
            >
              <Link href="/contact">
                <MessageCircle className="mr-1.5 h-4 w-4" />
                문의 페이지로
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <a href={`tel:${siteConfig.contact.phoneTel}`}>
                <Phone className="mr-1.5 h-4 w-4" />
                {siteConfig.contact.phone}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </article>
  );
}

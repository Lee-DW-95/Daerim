import "server-only";

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import {
  POST_CATEGORIES,
  type Post,
  type PostFrontmatter,
  type PostSummary,
} from "@/lib/types/post";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function isPostCategory(v: unknown): v is PostFrontmatter["category"] {
  return (
    typeof v === "string" &&
    (POST_CATEGORIES as readonly string[]).includes(v)
  );
}

function readPostFile(filename: string): Post | null {
  const slug = filename.replace(/\.mdx?$/, "");
  const filePath = path.join(POSTS_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  if (
    typeof data.title !== "string" ||
    typeof data.description !== "string" ||
    typeof data.date !== "string" ||
    !isPostCategory(data.category)
  ) {
    console.warn(`[mdx] frontmatter 누락/형식 오류: ${filename}`);
    return null;
  }

  return {
    slug,
    title: data.title,
    description: data.description,
    date: data.date,
    category: data.category,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    ogImage: typeof data.ogImage === "string" ? data.ogImage : undefined,
    author: typeof data.author === "string" ? data.author : undefined,
    draft: data.draft === true,
    content,
  };
}

function readAllRaw(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => /\.mdx?$/.test(f));
  return files
    .map(readPostFile)
    .filter((p): p is Post => p != null);
}

function toSummary(p: Post): PostSummary {
  const { content: _content, ...rest } = p;
  void _content;
  return rest;
}

export function getAllPosts(includeDraft = false): PostSummary[] {
  return readAllRaw()
    .filter((p) => includeDraft || !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(toSummary);
}

export function getPost(slug: string): Post | undefined {
  return readAllRaw().find((p) => p.slug === slug && !p.draft);
}

export function listPostSlugs(): string[] {
  return readAllRaw()
    .filter((p) => !p.draft)
    .map((p) => p.slug);
}

export function getPostsByCategory(category: string): PostSummary[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getPostsByTag(tag: string): PostSummary[] {
  return getAllPosts().filter((p) => p.tags?.includes(tag));
}

export function getUsedCategories(): string[] {
  const set = new Set<string>();
  for (const p of getAllPosts()) set.add(p.category);
  // 기본 정의 순서 우선.
  return (POST_CATEGORIES as readonly string[]).filter((c) => set.has(c));
}

export function getUsedTags(): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of getAllPosts()) {
    for (const t of p.tags ?? []) map.set(t, (map.get(t) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

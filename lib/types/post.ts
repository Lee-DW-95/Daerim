export const POST_CATEGORIES = [
  "단지분석",
  "하이닉스",
  "학군",
  "시장분석",
  "거래후기",
  "가이드",
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];

export type PostFrontmatter = {
  title: string;
  description: string;
  /** YYYY-MM-DD. */
  date: string;
  category: PostCategory;
  tags?: string[];
  /** 직접 지정한 OG 이미지 경로. 없으면 /og?title=... 으로 자동 생성. */
  ogImage?: string;
  author?: string;
  /** true면 목록·사이트맵에서 제외. */
  draft?: boolean;
};

export type Post = PostFrontmatter & {
  slug: string;
  /** Raw MDX/Markdown 본문. */
  content: string;
};

export type PostSummary = PostFrontmatter & { slug: string };

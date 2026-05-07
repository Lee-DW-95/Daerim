import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import type { ComponentProps } from "react";

const components = {
  a: ({ href = "#", ...props }: ComponentProps<"a">) => {
    const isInternal = href.startsWith("/") || href.startsWith("#");
    if (isInternal) {
      return (
        <Link
          href={href}
          className="font-medium text-primary underline-offset-4 hover:underline"
          {...props}
        />
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline-offset-4 hover:underline"
        {...props}
      />
    );
  },
  h2: (props: ComponentProps<"h2">) => (
    <h2
      className="mt-12 mb-4 scroll-mt-24 text-2xl font-bold tracking-tight"
      {...props}
    />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3
      className="mt-8 mb-3 scroll-mt-24 text-xl font-semibold tracking-tight"
      {...props}
    />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="my-4 leading-7 text-foreground/90" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul className="my-4 list-disc space-y-2 pl-6 leading-7" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className="my-4 list-decimal space-y-2 pl-6 leading-7" {...props} />
  ),
  li: (props: ComponentProps<"li">) => (
    <li className="leading-7" {...props} />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="my-6 border-l-4 border-primary/40 bg-secondary/30 px-4 py-2 italic text-muted-foreground"
      {...props}
    />
  ),
  code: (props: ComponentProps<"code">) => (
    <code
      className="rounded bg-secondary px-1.5 py-0.5 font-mono text-sm"
      {...props}
    />
  ),
  pre: (props: ComponentProps<"pre">) => (
    <pre
      className="my-6 overflow-x-auto rounded-lg border border-border bg-secondary/60 p-4 text-sm"
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-border" />,
  table: (props: ComponentProps<"table">) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm" {...props} />
    </div>
  ),
  th: (props: ComponentProps<"th">) => (
    <th
      className="bg-secondary/40 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      {...props}
    />
  ),
  td: (props: ComponentProps<"td">) => (
    <td className="border-t border-border px-3 py-2" {...props} />
  ),
};

export function MdxContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
        },
      }}
    />
  );
}

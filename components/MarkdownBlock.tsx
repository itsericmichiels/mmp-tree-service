import { renderMarkdownToHtml } from "@/lib/markdown";

export function MarkdownBlock({ markdown, className }: { markdown: string; className?: string }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(markdown) }}
    />
  );
}

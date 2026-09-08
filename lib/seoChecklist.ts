// lib/seoChecklist.ts
// On-page SEO checklist for blog posts, mirroring the core checks Rank
// Math / Yoast run against a focus keyword.
import { countLinks } from "./linkCount";
import { slugify } from "./slugify";

export type SeoCheckInput = {
  title: string;
  slug: string;
  seoDescription: string;
  bodyMarkdown: string;
  focusKeyword: string;
  coverImageAlt: string;
};

export type SeoCheck = {
  id: string;
  label: string;
  passed: boolean;
};

function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function includesKeyword(haystack: string, keyword: string): boolean {
  const trimmedKeyword = keyword.trim();
  if (!trimmedKeyword) return false;
  return haystack.toLowerCase().includes(trimmedKeyword.toLowerCase());
}

function firstParagraph(markdown: string): string {
  return markdown.trim().split(/\n\s*\n/)[0] ?? "";
}

function headingLines(markdown: string): string[] {
  return markdown
    .split("\n")
    .filter((line) => /^#{2,3}\s/.test(line.trim()))
    .map((line) => line.replace(/^#{2,3}\s/, ""));
}

function keywordDensityPercent(bodyMarkdown: string, keyword: string): number {
  const trimmedKeyword = keyword.trim().toLowerCase();
  if (!trimmedKeyword) return 0;
  const totalWords = wordCount(bodyMarkdown);
  if (totalWords === 0) return 0;
  const keywordWordCount = trimmedKeyword.split(/\s+/).length;
  const occurrences = bodyMarkdown.toLowerCase().split(trimmedKeyword).length - 1;
  return ((occurrences * keywordWordCount) / totalWords) * 100;
}

export function analyzeSeo(input: SeoCheckInput): SeoCheck[] {
  const { title, slug, seoDescription, bodyMarkdown, focusKeyword, coverImageAlt } = input;
  const density = keywordDensityPercent(bodyMarkdown, focusKeyword);

  return [
    {
      id: "keywordInTitle",
      label: "Focus keyword appears in the title",
      passed: includesKeyword(title, focusKeyword),
    },
    {
      id: "keywordInMetaDescription",
      label: "Focus keyword appears in the meta description",
      passed: includesKeyword(seoDescription, focusKeyword),
    },
    {
      id: "keywordInSlug",
      label: "Focus keyword appears in the URL slug",
      passed: focusKeyword.trim().length > 0 && slug.includes(slugify(focusKeyword)),
    },
    {
      id: "keywordInFirstParagraph",
      label: "Focus keyword appears in the first paragraph",
      passed: includesKeyword(firstParagraph(bodyMarkdown), focusKeyword),
    },
    {
      id: "keywordInSubheading",
      label: "Focus keyword appears in a subheading",
      passed: headingLines(bodyMarkdown).some((h) => includesKeyword(h, focusKeyword)),
    },
    {
      id: "keywordDensity",
      label: "Keyword density is reasonable (0.5%-2.5%)",
      passed: density >= 0.5 && density <= 2.5,
    },
    {
      id: "titleLength",
      label: "Title is 50-60 characters",
      passed: title.length >= 50 && title.length <= 60,
    },
    {
      id: "metaDescriptionLength",
      label: "Meta description is 120-160 characters",
      passed: seoDescription.length >= 120 && seoDescription.length <= 160,
    },
    {
      id: "contentLength",
      label: "Content is at least 600 words",
      passed: wordCount(bodyMarkdown) >= 600,
    },
    {
      id: "internalLinks",
      label: "At least 5 internal links",
      passed: countLinks(bodyMarkdown).internal >= 5,
    },
    {
      id: "externalLinks",
      label: "At least 5 external links",
      passed: countLinks(bodyMarkdown).external >= 5,
    },
    {
      id: "altText",
      label: "Cover image alt text is filled in",
      passed: coverImageAlt.trim().length > 0,
    },
  ];
}

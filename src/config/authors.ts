/**
 * Author registry (v1.7) — E-E-A-T enrichment for the article `author` field.
 *
 * 👉 APPLY TEMPLATE: edit for your own authors (or leave empty — a bare
 * author name still renders, it just won't link out).
 *
 * Key = the exact `author:` value in article frontmatter.
 * Value = optional profile URL (linked on the article header + used as
 * `Person` JSON-LD `sameAs`). Avatar is not yet rendered — URLs only for now.
 */
export interface AuthorInfo {
  /** Profile page (personal site, social, or your site's author page). */
  url?: string;
  /** Social profiles folded into JSON-LD sameAs. */
  sameAs?: string[];
}

export const authors: Record<string, AuthorInfo> = {
  // Editorial team byline (site.defaultAuthor) — links to the about page so
  // the author meta line and Article JSON-LD resolve to a real page on-site.
  'NMS Wiki Team': { url: '/about' },
  // Example:
  // 'Yuan Ruiqin': { url: 'https://yuanruiqin.dev', sameAs: ['https://github.com/PNGTRID'] },
};

/** Look up an author by frontmatter name (undefined = no entry). */
export function getAuthor(name: string | undefined): AuthorInfo | undefined {
  if (!name) return undefined;
  return authors[name];
}

/**
 * RSS feed (/rss.xml) — the default-locale (English) article feed.
 *
 * Uses @astrojs/rss (already a dependency). Items are sorted newest-first
 * by frontmatter `date`, capped at 50. Codes / patch-note style sites get
 * frequent updates — RSS lets readers and aggregators follow without
 * manually re-visiting.
 *
 * A `<link rel="alternate">` for auto-discovery is injected in BaseLayout.
 */
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { site, siteUrl } from '~/config/site';
import { getCollection } from 'astro:content';
import { parseEntryId } from '~/lib/content';
import { defaultLocale } from '~/i18n/routing';
import { detailPath } from '~/lib/url';

export const GET: APIRoute = async (context) => {
  const all = await getCollection('wiki');
  const items = all
    .filter((e) => {
      const parsed = parseEntryId(e.id);
      // Only default-locale, published articles (no noindex, no drafts).
      return parsed?.locale === defaultLocale && !e.data.noindex && !e.data.draft;
    })
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .slice(0, 50);

  return rss({
    title: site.name,
    description: site.description,
    site: context.site ?? 'https://anvilwiki.pages.dev',
    items: items.map((e) => {
      const parsed = parseEntryId(e.id);
      const slug = parsed?.slug ?? '';
      return {
        title: e.data.title,
        description: e.data.description,
        pubDate: e.data.date,
        // Pass an ABSOLUTE URL — @astrojs/rss normalizes relative links by
        // appending a trailing slash, which 404s on this site
        // (trailingSlash: 'never'). See the same class of bug in SearchButton.
        link: `${siteUrl}${detailPath(e.data.category, slug, defaultLocale)}`,
        categories: [e.data.category],
      };
    }),
    // xhtml language tag — helps RSS readers detect content language.
    customData: `<language>en</language>`,
  });
};

// Static endpoint — prerendered at build time.
export const prerender = true;

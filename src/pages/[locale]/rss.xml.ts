/**
 * Per-locale RSS feeds (/<locale>/rss.xml) — same shape as the default-locale
 * /rss.xml, but scoped to one locale's own articles (no English fallback:
 * a feed is a list, and lists don't fall back — PRD §9.3).
 *
 * Feed autodiscovery: BaseLayout points each page at its own locale's feed.
 */
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site, siteUrl } from '~/config/site';
import { parseEntryId } from '~/lib/content';
import { defaultLocale, LOCALE_LABELS, locales, type Locale } from '~/i18n/routing';
import { getUi } from '~/i18n/ui';
import { detailPath } from '~/lib/url';

export async function getStaticPaths() {
  return locales
    .filter((l) => l !== defaultLocale)
    .map((l) => ({ params: { locale: l } }));
}

export const GET: APIRoute = async (context) => {
  const localeParam = context.params.locale as Locale;
  if (localeParam === defaultLocale) return new Response(null, { status: 404 });

  const all = await getCollection('wiki');
  const items = all
    .filter((e) => {
      const parsed = parseEntryId(e.id);
      return parsed?.locale === localeParam && !e.data.noindex && !e.data.draft;
    })
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .slice(0, 50);

  // Localized site strings when the locale JSON provides them (it does for
  // all shipped locales); fall back to the config-level English defaults.
  const ui = getUi(localeParam) as unknown as {
    site?: { name?: string; description?: string };
  };

  return rss({
    title: `${ui.site?.name ?? site.name} (${LOCALE_LABELS[localeParam]})`,
    description: ui.site?.description ?? site.description,
    site: context.site ?? siteUrl,
    items: items.map((e) => {
      const parsed = parseEntryId(e.id);
      const slug = parsed?.slug ?? '';
      return {
        title: e.data.title,
        description: e.data.description,
        pubDate: e.data.date,
        // Absolute URL — see the note in rss.xml.ts (trailing-slash bug).
        link: `${siteUrl}${detailPath(e.data.category, slug, localeParam)}`,
        categories: [e.data.category],
      };
    }),
    customData: `<language>${localeParam}</language>`,
  });
};

// Static endpoint — prerendered at build time.
export const prerender = true;

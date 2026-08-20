import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { locales, defaultLocale } from './src/i18n/routing';
import { CONTENT_TYPES } from './src/config/navigation';

/**
 * Build a map of page path → lastmod ISO date, read from MDX frontmatter
 * (`lastModified` falling back to `date`). Used by the sitemap `serialize`
 * hook so Google gets the one sitemap field it actually trusts for crawl
 * scheduling (Google Search Central docs).
 *
 * Plain fs scan at config time — `astro:content` is not importable here.
 */
function buildLastmodMap(): Map<string, string> {
  const map = new Map<string, string>();
  const base = path.resolve('./src/content/wiki');
  if (!fs.existsSync(base)) return map;

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(p);
        continue;
      }
      if (!entry.name.endsWith('.mdx')) continue;
      const src = fs.readFileSync(p, 'utf8');
      // Drafts never publish — their dates must not leak into list-page
      // lastmod (would tell Google a page updated that didn't).
      if (/^draft:\s*true\s*$/m.test(src.split('---')[1] ?? '')) continue;
      const fm = src.split('---')[1] ?? '';
      const lm = fm.match(/^lastModified:\s*(.+)$/m)?.[1]?.trim();
      const dt = fm.match(/^date:\s*(.+)$/m)?.[1]?.trim();
      const iso = (lm || dt || '').replace(/['"]/g, '');
      if (!iso) continue;
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) continue;

      // Path relative to the content base → locale/category/slug.
      const rel = path.relative(base, p).replace(/\.mdx$/, '');
      const [loc, cat, ...rest] = rel.split(path.sep);
      const slugPath = rest.join('/');
      // Track which locales have a real file for this article (used to
      // exclude English-fallback URLs from the sitemap below).
      const key = `${cat}/${slugPath}`;
      if (!articleLocales.has(key)) articleLocales.set(key, new Set());
      articleLocales.get(key)!.add(loc);
      // Trailing-slash keys — canonical URLs on this site end with "/".
      const articlePath =
        loc === defaultLocale ? `/${cat}/${slugPath}/` : `/${loc}/${cat}/${slugPath}/`;
      map.set(articlePath, date.toISOString());

      // List pages: newest article in the category wins.
      const listPagePath = loc === defaultLocale ? `/${cat}/` : `/${loc}/${cat}/`;
      const existing = map.get(listPagePath);
      if (!existing || existing < date.toISOString()) {
        map.set(listPagePath, date.toISOString());
      }

      publishedCounts.set(`${loc}/${cat}`, (publishedCounts.get(`${loc}/${cat}`) ?? 0) + 1);
    }
  };
  walk(base);
  return map;
}

/**
 * Category list pages with zero published articles in a locale render an
 * "empty" state. They get noindex at render time (ListPage) and are dropped
 * from the sitemap here — a sitemap should only list indexable URLs.
 */
function buildEmptyListPaths(): Set<string> {
  const empty = new Set<string>();
  for (const loc of locales) {
    for (const cat of CONTENT_TYPES) {
      if ((publishedCounts.get(`${loc}/${cat}`) ?? 0) === 0) {
        empty.add(loc === defaultLocale ? `/${cat}` : `/${loc}/${cat}`);
      }
    }
  }
  return empty;
}

const publishedCounts = new Map<string, number>();
/** article key (`category/slug`) → locales that have a real published file. */
const articleLocales = new Map<string, Set<string>>();

const lastmodMap = buildLastmodMap();
const emptyListPaths = buildEmptyListPaths();

/**
 * English-fallback article URLs. A default-locale article with no translated
 * file still renders at /<locale>/<category>/<slug>/ (English fallback, see
 * i18n fallback rules) — noindexed at render time, excluded from hreflang,
 * and dropped here so the sitemap only lists indexable URLs.
 */
function buildFallbackPaths(): Set<string> {
  const fallback = new Set<string>();
  for (const [key, locs] of articleLocales) {
    if (!locs.has(defaultLocale)) continue;
    for (const loc of locales) {
      if (loc === defaultLocale || locs.has(loc)) continue;
      fallback.add(`/${loc}/${key}`);
    }
  }
  return fallback;
}
const fallbackPaths = buildFallbackPaths();

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://nomanssky.wiki',
  output: 'static',
  // Directory pages are served at "/path/" (CF Pages 308s "/path" → "/path/");
  // 'always' makes canonical/sitemap/internal links agree with that.
  trailingSlash: 'always',
  image: {
    // Emit explicit width/height on responsive <Image> output to prevent CLS.
    responsiveStyles: true,
  },
  // Prefetch all internal links on hover — faster page transitions, no
  // View Transitions runtime needed. Adds a small IntersectionObserver script.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  i18n: {
    // Spread to convert readonly tuple to mutable array (Astro's Locales type).
    locales: [...locales],
    defaultLocale,
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale,
        locales: Object.fromEntries(locales.map((l) => [l, l])),
      },
      // Empty category list pages and English-fallback article URLs are
      // noindex — a sitemap must only list indexable URLs (compare
      // slash-agnostic: filter sees the raw path).
      filter: (page) => {
        try {
          const p = new URL(page).pathname.replace(/\/+$/, '') || '/';
          return !emptyListPaths.has(p) && !fallbackPaths.has(p);
        } catch {
          return true;
        }
      },
      // Inject <lastmod> from article frontmatter (see buildLastmodMap) and
      // normalize URLs to the trailing-slash canonical form.
      serialize(item) {
        try {
          const raw = new URL(item.url);
          const slashed =
            raw.pathname === '/' ? '/' : raw.pathname.replace(/\/?$/, '/');
          item.url = new URL(slashed, raw.origin).href;
          const lm = lastmodMap.get(slashed);
          if (lm) item.lastmod = lm;
        } catch {
          /* non-URL entries keep default behavior */
        }
        return item;
      },
    }),
    tailwind({ applyBaseStyles: false }),
    icon(),
  ],
  vite: {
    resolve: {
      alias: {
        '~': '/src',
      },
    },
  },
});

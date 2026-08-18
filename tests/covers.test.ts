/**
 * Cover generator tests — guard the invariants that make the pipeline
 * safe to re-run on every article batch:
 *
 *  1. Determinism — same (category, slug) must produce a byte-identical
 *     SVG. If this breaks, an unrelated re-run churns every committed
 *     webp in git.
 *  2. Uniqueness — different articles must differ (seed actually binds
 *     to the slug).
 *  3. librsvg safety — no <text> (system-font dependent, irreproducible)
 *     and no external refs (file:// or http).
 *  4. og:image contract — root element carries the exact 1200x630 size
 *     that BaseLayout's og:image:width/height meta promises.
 */
import { describe, expect, it } from 'vitest';
import { buildCoverSvg, COVER_WIDTH, COVER_HEIGHT } from '../scripts/generate-covers';

const CATEGORIES = [
  'cosmos-update',
  'expeditions',
  'starships',
  'multitools',
  'base-building',
  'guides',
];

describe('buildCoverSvg', () => {
  it('is deterministic for the same category+slug', () => {
    for (const cat of CATEGORIES) {
      const a = buildCoverSvg(cat, 'some-article');
      const b = buildCoverSvg(cat, 'some-article');
      expect(a).toBe(b);
    }
  });

  it('differs between slugs and between categories', () => {
    const a = buildCoverSvg('starships', 'alpha');
    const b = buildCoverSvg('starships', 'beta');
    const c = buildCoverSvg('expeditions', 'alpha');
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
  });

  it('contains no <text> elements or external references', () => {
    for (const cat of CATEGORIES) {
      const svg = buildCoverSvg(cat, 'some-article');
      expect(svg).not.toContain('<text');
      // href is only legal as an internal fragment (#id); url(#id) fills are internal too.
      expect(svg).not.toMatch(/(href|xlink:href)\s*=\s*["'](?!#)/);
      expect(svg).not.toMatch(/url\(#(?!sky|planetFill|vig|soft)/);
    }
  });

  it('declares the og:image contract size on the root element', () => {
    const svg = buildCoverSvg('guides', 'some-article');
    expect(svg).toContain(`width="${COVER_WIDTH}"`);
    expect(svg).toContain(`height="${COVER_HEIGHT}"`);
    expect(svg.startsWith('<svg')).toBe(true);
  });
});
